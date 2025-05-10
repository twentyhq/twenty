import { useApolloClient } from '@apollo/client';
import { useCallback, useMemo } from 'react';
import { useRecoilCallback, useRecoilState } from 'recoil';
import { v4 } from 'uuid';

import { useUploadAttachmentFile } from '@/activities/files/hooks/useUploadAttachmentFile';
import { useUpsertActivity } from '@/activities/hooks/useUpsertActivity';
import { canCreateActivityState } from '@/activities/states/canCreateActivityState';
import { ActivityEditorHotkeyScope } from '@/activities/types/ActivityEditorHotkeyScope';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { modifyRecordFromCache } from '@/object-record/cache/utils/modifyRecordFromCache';
import { isFieldValueReadOnly } from '@/object-record/record-field/utils/isFieldValueReadOnly';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { isNonTextWritingKey } from '@/ui/utilities/hotkey/utils/isNonTextWritingKey';
import { Key } from 'ts-key-enum';
import { useDebouncedCallback } from 'use-debounce';

import { BLOCK_SCHEMA } from '@/activities/blocks/constants/Schema';
import { ActivityRichTextEditorChangeOnActivityIdEffect } from '@/activities/components/ActivityRichTextEditorChangeOnActivityIdEffect';
import { ActivityRichTextEditorDeleteAttachmentsEffect } from '@/activities/components/ActivityRichTextEditorDeleteAttachmentsEffect';
import { isActivityAttachmentDeletionCheckNeededState } from '@/activities/states/shouldCheckForAttachmentToDeleteFamilyState';
import { Note } from '@/activities/types/Note';
import { Task } from '@/activities/types/Task';
import { CommandMenuHotkeyScope } from '@/command-menu/types/CommandMenuHotkeyScope';
import { useIsRecordReadOnly } from '@/object-record/record-field/hooks/useIsRecordReadOnly';
import { BlockEditor } from '@/ui/input/editor/components/BlockEditor';
import { PartialBlock } from '@blocknote/core';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import { useCreateBlockNote } from '@blocknote/react';
import '@blocknote/react/style.css';
import { isArray, isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

type ActivityRichTextEditorProps = {
  activityId: string;
  activityObjectNameSingular:
    | CoreObjectNameSingular.Task
    | CoreObjectNameSingular.Note;
};

export const ActivityRichTextEditor = ({
  activityId,
  activityObjectNameSingular,
}: ActivityRichTextEditorProps) => {
  const [activityInStore] = useRecoilState(recordStoreFamilyState(activityId));

  const cache = useApolloClient().cache;
  const activity = activityInStore as Task | Note | null;

  const [, setIsActivityAttachmentDeletionCheckNeeded] = useRecoilState(
    isActivityAttachmentDeletionCheckNeededState,
  );

  const { objectMetadataItem: objectMetadataItemActivity } =
    useObjectMetadataItem({
      objectNameSingular: activityObjectNameSingular,
    });

  const isRecordReadOnly = useIsRecordReadOnly({ recordId: activityId });

  const isReadOnly = isFieldValueReadOnly({
    objectNameSingular: activityObjectNameSingular,
    isRecordReadOnly,
  });

  const {
    goBackToPreviousHotkeyScope,
    setHotkeyScopeAndMemorizePreviousScope,
  } = usePreviousHotkeyScope();

  const { upsertActivity } = useUpsertActivity({
    activityObjectNameSingular: activityObjectNameSingular,
  });

  const persistBodyDebounced = useDebouncedCallback((blocknote: string) => {
    if (isReadOnly) return;

    const input = {
      bodyV2: {
        blocknote,
        markdown: null,
      },
    };

    if (isDefined(activity)) {
      upsertActivity({
        activity,
        input,
      });
    }
  }, 300);

  const [canCreateActivity, setCanCreateActivity] = useRecoilState(
    canCreateActivityState,
  );

  const { uploadAttachmentFile } = useUploadAttachmentFile();

  const handleUploadAttachment = async (file: File) => {
    return await uploadAttachmentFile(file, {
      id: activityId,
      targetObjectNameSingular: activityObjectNameSingular,
    });
  };

  const prepareBody = (newStringifiedBody: string) => {
    if (!newStringifiedBody) return newStringifiedBody;

    const body = JSON.parse(newStringifiedBody);

    const bodyWithSignedPayload = body.map((block: any) => {
      if (block.type !== 'image' || !block.props.url) {
        return block;
      }

      const imageProps = block.props;
      const imageUrl = new URL(imageProps.url);

      return {
        ...block,
        props: {
          ...imageProps,
          url: `${imageUrl.toString()}`,
        },
      };
    });
    return JSON.stringify(bodyWithSignedPayload);
  };

  const handlePersistBody = useCallback(
    (activityBody: string) => {
      if (!canCreateActivity) {
        setCanCreateActivity(true);
      }

      persistBodyDebounced(prepareBody(activityBody));
    },
    [persistBodyDebounced, setCanCreateActivity, canCreateActivity],
  );

  const handleBodyChange = useRecoilCallback(
    ({ set }) =>
      (newStringifiedBody: string) => {
        set(recordStoreFamilyState(activityId), (oldActivity) => {
          return {
            ...oldActivity,
            id: activityId,
            bodyV2: {
              blocknote: newStringifiedBody,
              markdown: null,
            },
            __typename: 'Activity',
          };
        });

        modifyRecordFromCache({
          recordId: activityId,
          fieldModifiers: {
            bodyV2: () => {
              return {
                blocknote: newStringifiedBody,
                markdown: null,
              };
            },
          },
          cache,
          objectMetadataItem: objectMetadataItemActivity,
        });

        handlePersistBody(newStringifiedBody);
      },
    [activityId, cache, objectMetadataItemActivity, handlePersistBody],
  );

  const handleBodyChangeDebounced = useDebouncedCallback(handleBodyChange, 500);

  const handleEditorChange = () => {
    setIsActivityAttachmentDeletionCheckNeeded(true);
    const newStringifiedBody = JSON.stringify(editor.document) ?? '';

    handleBodyChangeDebounced(newStringifiedBody);
  };

  const initialBody = useMemo(() => {
    const blocknote = activity?.bodyV2?.blocknote;

    if (
      isDefined(activity) &&
      isNonEmptyString(blocknote) &&
      blocknote !== '{}'
    ) {
      let parsedBody: PartialBlock[] | undefined = undefined;

      // TODO: Remove this once we have removed the old rich text
      try {
        parsedBody = JSON.parse(blocknote);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn(
          `Failed to parse body for activity ${activityId}, for rich text version 'v2'`,
        );
        // eslint-disable-next-line no-console
        console.warn(blocknote);
      }

      if (isArray(parsedBody) && parsedBody.length === 0) {
        return undefined;
      }

      return parsedBody;
    }

    return undefined;
  }, [activity, activityId]);

  const handleEditorBuiltInUploadFile = async (file: File) => {
    const { attachmentAbsoluteURL } = await handleUploadAttachment(file);

    return attachmentAbsoluteURL;
  };

  const editor = useCreateBlockNote({
    initialContent: initialBody,
    domAttributes: { editor: { class: 'editor' } },
    schema: BLOCK_SCHEMA,
    uploadFile: handleEditorBuiltInUploadFile,
  });

  useScopedHotkeys(
    Key.Escape,
    () => {
      editor.domElement?.blur();
    },
    ActivityEditorHotkeyScope.ActivityBody,
  );

  useScopedHotkeys(
    '*',
    (keyboardEvent) => {
      if (keyboardEvent.key === Key.Escape) {
        return;
      }

      const isWritingText =
        !isNonTextWritingKey(keyboardEvent.key) &&
        !keyboardEvent.ctrlKey &&
        !keyboardEvent.metaKey;

      if (!isWritingText) {
        return;
      }

      keyboardEvent.preventDefault();
      keyboardEvent.stopPropagation();
      keyboardEvent.stopImmediatePropagation();

      const newBlockId = v4();
      const newBlock = {
        id: newBlockId,
        type: 'paragraph' as const,
        content: keyboardEvent.key,
      };

      const lastBlock = editor.document[editor.document.length - 1];
      editor.insertBlocks([newBlock], lastBlock);

      editor.setTextCursorPosition(newBlockId, 'end');
      editor.focus();
    },
    CommandMenuHotkeyScope.CommandMenuFocused,
    [],
    {
      preventDefault: false,
    },
  );

  const handleBlockEditorFocus = () => {
    setHotkeyScopeAndMemorizePreviousScope(
      ActivityEditorHotkeyScope.ActivityBody,
    );
  };

  const handlerBlockEditorBlur = () => {
    goBackToPreviousHotkeyScope();
  };

  return (
    <>
      <ActivityRichTextEditorDeleteAttachmentsEffect activityId={activityId} />
      <ActivityRichTextEditorChangeOnActivityIdEffect
        editor={editor}
        activityId={activityId}
      />
      <BlockEditor
        onFocus={handleBlockEditorFocus}
        onBlur={handlerBlockEditorBlur}
        onChange={handleEditorChange}
        editor={editor}
        readonly={isReadOnly}
      />
    </>
  );
};

import { useApolloClient } from '@apollo/client';
import { useCreateBlockNote } from '@blocknote/react';
import { isArray, isNonEmptyString } from '@sniptt/guards';
import { useCallback, useMemo } from 'react';
import { useRecoilCallback, useRecoilState } from 'recoil';
import { Key } from 'ts-key-enum';
import { useDebouncedCallback } from 'use-debounce';
import { v4 } from 'uuid';

import { useUpsertActivity } from '@/activities/hooks/useUpsertActivity';
import { activityBodyFamilyState } from '@/activities/states/activityBodyFamilyState';
import { activityTitleHasBeenSetFamilyState } from '@/activities/states/activityTitleHasBeenSetFamilyState';
import { canCreateActivityState } from '@/activities/states/canCreateActivityState';
import { ActivityEditorHotkeyScope } from '@/activities/types/ActivityEditorHotkeyScope';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { modifyRecordFromCache } from '@/object-record/cache/utils/modifyRecordFromCache';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { BlockEditor } from '@/ui/input/editor/components/BlockEditor';
import { RightDrawerHotkeyScope } from '@/ui/layout/right-drawer/types/RightDrawerHotkeyScope';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { isNonTextWritingKey } from '@/ui/utilities/hotkey/utils/isNonTextWritingKey';
import { isDefined } from '~/utils/isDefined';

import { BLOCK_SCHEMA } from '@/activities/blocks/constants/Schema';
import { useUploadAttachmentFile } from '@/activities/files/hooks/useUploadAttachmentFile';
import { Note } from '@/activities/types/Note';
import { Task } from '@/activities/types/Task';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import '@blocknote/react/style.css';

type RichTextEditorProps = {
  activityId: string;
  fillTitleFromBody: boolean;
  activityObjectNameSingular:
    | CoreObjectNameSingular.Task
    | CoreObjectNameSingular.Note;
};

export const RichTextEditor = ({
  activityId,
  fillTitleFromBody,
  activityObjectNameSingular,
}: RichTextEditorProps) => {
  const [activityInStore] = useRecoilState(recordStoreFamilyState(activityId));

  const cache = useApolloClient().cache;
  const activity = activityInStore as Task | Note | null;

  const [activityTitleHasBeenSet, setActivityTitleHasBeenSet] = useRecoilState(
    activityTitleHasBeenSetFamilyState({
      activityId: activityId,
    }),
  );

  const [activityBody, setActivityBody] = useRecoilState(
    activityBodyFamilyState({
      activityId: activityId,
    }),
  );

  const { objectMetadataItem: objectMetadataItemActivity } =
    useObjectMetadataItem({
      objectNameSingular: activityObjectNameSingular,
    });

  const {
    goBackToPreviousHotkeyScope,
    setHotkeyScopeAndMemorizePreviousScope,
  } = usePreviousHotkeyScope();

  const { upsertActivity } = useUpsertActivity({
    activityObjectNameSingular: activityObjectNameSingular,
  });

  const persistBodyDebounced = useDebouncedCallback((newBody: string) => {
    if (isDefined(activity)) {
      upsertActivity({
        activity,
        input: {
          body: newBody,
        },
      });
    }
  }, 300);

  const persistTitleAndBodyDebounced = useDebouncedCallback(
    (newTitle: string, newBody: string) => {
      if (isDefined(activity)) {
        upsertActivity({
          activity,
          input: {
            title: newTitle,
            body: newBody,
          },
        });

        setActivityTitleHasBeenSet(true);
      }
    },
    200,
  );

  const updateTitleAndBody = useCallback(
    (newStringifiedBody: string) => {
      const blockBody = JSON.parse(newStringifiedBody);
      const newTitleFromBody = blockBody[0]?.content?.[0]?.text;

      persistTitleAndBodyDebounced(newTitleFromBody, newStringifiedBody);
    },
    [persistTitleAndBodyDebounced],
  );

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

      if (!activityTitleHasBeenSet && fillTitleFromBody) {
        updateTitleAndBody(activityBody);
      } else {
        persistBodyDebounced(prepareBody(activityBody));
      }
    },
    [
      fillTitleFromBody,
      persistBodyDebounced,
      activityTitleHasBeenSet,
      updateTitleAndBody,
      setCanCreateActivity,
      canCreateActivity,
    ],
  );

  const handleBodyChange = useRecoilCallback(
    ({ snapshot, set }) =>
      (newStringifiedBody: string) => {
        set(recordStoreFamilyState(activityId), (oldActivity) => {
          return {
            ...oldActivity,
            id: activityId,
            body: newStringifiedBody,
            __typename: 'Activity',
          };
        });

        modifyRecordFromCache({
          recordId: activityId,
          fieldModifiers: {
            body: () => {
              return newStringifiedBody;
            },
          },
          cache,
          objectMetadataItem: objectMetadataItemActivity,
        });

        const activityTitleHasBeenSet = snapshot
          .getLoadable(
            activityTitleHasBeenSetFamilyState({
              activityId: activityId,
            }),
          )
          .getValue();

        const blockBody = JSON.parse(newStringifiedBody);
        const newTitleFromBody = blockBody[0]?.content?.[0]?.text as string;

        if (!activityTitleHasBeenSet && fillTitleFromBody) {
          set(recordStoreFamilyState(activityId), (oldActivity) => {
            return {
              ...oldActivity,
              id: activityId,
              title: newTitleFromBody,
              __typename: 'Activity',
            };
          });

          modifyRecordFromCache({
            recordId: activityId,
            fieldModifiers: {
              title: () => {
                return newTitleFromBody;
              },
            },
            cache,
            objectMetadataItem: objectMetadataItemActivity,
          });
        }

        handlePersistBody(newStringifiedBody);
      },
    [
      activityId,
      cache,
      objectMetadataItemActivity,
      fillTitleFromBody,
      handlePersistBody,
    ],
  );

  const handleBodyChangeDebounced = useDebouncedCallback(handleBodyChange, 500);

  // See https://github.com/twentyhq/twenty/issues/6724 for explanation
  const setActivityBodyDebouncedToAvoidDragBug = useDebouncedCallback(
    setActivityBody,
    100,
  );

  const handleEditorChange = () => {
    const newStringifiedBody = JSON.stringify(editor.document) ?? '';

    setActivityBodyDebouncedToAvoidDragBug(newStringifiedBody);

    handleBodyChangeDebounced(newStringifiedBody);
  };

  const initialBody = useMemo(() => {
    if (isNonEmptyString(activityBody) && activityBody !== '{}') {
      return JSON.parse(activityBody);
    } else if (
      isDefined(activity) &&
      isNonEmptyString(activity.body) &&
      activity?.body !== '{}'
    ) {
      return JSON.parse(activity.body);
    } else {
      return undefined;
    }
  }, [activity, activityBody]);

  const handleEditorBuiltInUploadFile = async (file: File) => {
    const { attachementAbsoluteURL } = await handleUploadAttachment(file);

    return attachementAbsoluteURL;
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

      const blockIdentifier = editor.getTextCursorPosition().block;
      const currentBlockContent = blockIdentifier?.content;

      if (
        isDefined(currentBlockContent) &&
        isArray(currentBlockContent) &&
        currentBlockContent.length === 0
      ) {
        // Empty block case
        editor.updateBlock(blockIdentifier, {
          content: keyboardEvent.key,
        });
        return;
      }

      if (
        isDefined(currentBlockContent) &&
        isArray(currentBlockContent) &&
        isDefined(currentBlockContent[0]) &&
        currentBlockContent[0].type === 'text'
      ) {
        // Text block case
        editor.updateBlock(blockIdentifier, {
          content: currentBlockContent[0].text + keyboardEvent.key,
        });
        return;
      }

      const newBlockId = v4();
      const newBlock = {
        id: newBlockId,
        type: 'paragraph' as const,
        content: keyboardEvent.key,
      };
      editor.insertBlocks([newBlock], blockIdentifier, 'after');

      editor.setTextCursorPosition(newBlockId, 'end');
      editor.focus();
    },
    RightDrawerHotkeyScope.RightDrawer,
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
    <BlockEditor
      onFocus={handleBlockEditorFocus}
      onBlur={handlerBlockEditorBlur}
      onChange={handleEditorChange}
      editor={editor}
    />
  );
};

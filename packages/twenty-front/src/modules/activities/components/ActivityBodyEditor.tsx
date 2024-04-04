import { ClipboardEvent, useCallback, useMemo } from 'react';
import { useApolloClient } from '@apollo/client';
import { useCreateBlockNote } from '@blocknote/react';
import { isArray, isNonEmptyString } from '@sniptt/guards';
import { useRecoilCallback, useRecoilState } from 'recoil';
import { Key } from 'ts-key-enum';
import { useDebouncedCallback } from 'use-debounce';
import { v4 } from 'uuid';

import { blockSchema } from '@/activities/blocks/schema';
import { useUpsertActivity } from '@/activities/hooks/useUpsertActivity';
import { activityBodyFamilyState } from '@/activities/states/activityBodyFamilyState';
import { activityTitleHasBeenSetFamilyState } from '@/activities/states/activityTitleHasBeenSetFamilyState';
import { canCreateActivityState } from '@/activities/states/canCreateActivityState';
import { Activity } from '@/activities/types/Activity';
import { ActivityEditorHotkeyScope } from '@/activities/types/ActivityEditorHotkeyScope';
import { useObjectMetadataItemOnly } from '@/object-metadata/hooks/useObjectMetadataItemOnly';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { modifyRecordFromCache } from '@/object-record/cache/utils/modifyRecordFromCache';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { BlockEditor } from '@/ui/input/editor/components/BlockEditor';
import { RightDrawerHotkeyScope } from '@/ui/layout/right-drawer/types/RightDrawerHotkeyScope';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { isNonTextWritingKey } from '@/ui/utilities/hotkey/utils/isNonTextWritingKey';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { FileFolder, useUploadFileMutation } from '~/generated/graphql';
import { isDefined } from '~/utils/isDefined';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

import { getFileType } from '../files/utils/getFileType';

import '@blocknote/react/style.css';

type ActivityBodyEditorProps = {
  activityId: string;
  fillTitleFromBody: boolean;
};

export const ActivityBodyEditor = ({
  activityId,
  fillTitleFromBody,
}: ActivityBodyEditorProps) => {
  const [activityInStore] = useRecoilState(recordStoreFamilyState(activityId));
  const cache = useApolloClient().cache;
  const activity = activityInStore as Activity | null;

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
    useObjectMetadataItemOnly({
      objectNameSingular: CoreObjectNameSingular.Activity,
    });

  const {
    goBackToPreviousHotkeyScope,
    setHotkeyScopeAndMemorizePreviousScope,
  } = usePreviousHotkeyScope();

  const { upsertActivity } = useUpsertActivity();

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

  const [uploadFile] = useUploadFileMutation();

  const handleUploadAttachment = async (file: File): Promise<string> => {
    if (isUndefinedOrNull(file)) {
      return '';
    }
    const result = await uploadFile({
      variables: {
        file,
        fileFolder: FileFolder.Attachment,
      },
    });
    if (!result?.data?.uploadFile) {
      throw new Error("Couldn't upload Image");
    }
    const imageUrl =
      REACT_APP_SERVER_BASE_URL + '/files/' + result?.data?.uploadFile;
    return imageUrl;
  };

  const handlePersistBody = useCallback(
    (activityBody: string) => {
      if (!canCreateActivity) {
        setCanCreateActivity(true);
      }

      if (!activityTitleHasBeenSet && fillTitleFromBody) {
        updateTitleAndBody(activityBody);
      } else {
        persistBodyDebounced(activityBody);
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

  const handleEditorChange = () => {
    const newStringifiedBody = JSON.stringify(editor.document) ?? '';

    setActivityBody(newStringifiedBody);

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

  const editor = useCreateBlockNote({
    initialContent: initialBody,
    domAttributes: { editor: { class: 'editor' } },
    schema: blockSchema,
    uploadFile: handleUploadAttachment,
  });

  const handleImagePaste = async (event: ClipboardEvent) => {
    const clipboardItems = event.clipboardData?.items;

    if (isDefined(clipboardItems)) {
      for (let i = 0; i < clipboardItems.length; i++) {
        if (clipboardItems[i].kind === 'file') {
          const isImage = clipboardItems[i].type.match('^image/');
          const pastedFile = clipboardItems[i].getAsFile();
          if (!pastedFile) {
            return;
          }

          const attachmentUrl = await handleUploadAttachment(pastedFile);

          if (!attachmentUrl) {
            return;
          }

          if (isDefined(isImage)) {
            editor?.insertBlocks(
              [
                {
                  type: 'image',
                  props: {
                    url: attachmentUrl,
                  },
                },
              ],
              editor?.getTextCursorPosition().block,
              'after',
            );
          } else {
            editor?.insertBlocks(
              [
                {
                  type: 'file',
                  props: {
                    url: attachmentUrl,
                    fileType: getFileType(pastedFile.name),
                    name: pastedFile.name,
                  },
                },
              ],
              editor?.getTextCursorPosition().block,
              'after',
            );
          }
        }
      }
    }
  };

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
      onPaste={handleImagePaste}
      onChange={handleEditorChange}
      editor={editor}
    />
  );
};

import { useCallback, useEffect, useState } from 'react';
import { BlockNoteEditor } from '@blocknote/core';
import { useBlockNote } from '@blocknote/react';
import styled from '@emotion/styled';
import { isArray, isNonEmptyString } from '@sniptt/guards';
import { useRecoilState } from 'recoil';
import { Key } from 'ts-key-enum';
import { useDebouncedCallback } from 'use-debounce';
import { v4 } from 'uuid';

import { useUpsertActivity } from '@/activities/hooks/useUpsertActivity';
import { activityTitleHasBeenSetFamilyState } from '@/activities/states/activityTitleHasBeenSetFamilyState';
import { Activity } from '@/activities/types/Activity';
import { ActivityEditorHotkeyScope } from '@/activities/types/ActivityEditorHotkeyScope';
import { useObjectMetadataItemOnly } from '@/object-metadata/hooks/useObjectMetadataItemOnly';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useModifyRecordFromCache } from '@/object-record/cache/hooks/useModifyRecordFromCache';
import { BlockEditor } from '@/ui/input/editor/components/BlockEditor';
import { RightDrawerHotkeyScope } from '@/ui/layout/right-drawer/types/RightDrawerHotkeyScope';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { isNonTextWritingKey } from '@/ui/utilities/hotkey/utils/isNonTextWritingKey';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { FileFolder, useUploadFileMutation } from '~/generated/graphql';

import { blockSpecs } from '../blocks/blockSpecs';
import { getSlashMenu } from '../blocks/slashMenu';
import { getFileType } from '../files/utils/getFileType';

import '@blocknote/react/style.css';

const StyledBlockNoteStyledContainer = styled.div`
  width: 100%;
`;

type ActivityBodyEditorProps = {
  activity: Activity;
  fillTitleFromBody: boolean;
};

export const ActivityBodyEditor = ({
  activity,
  fillTitleFromBody,
}: ActivityBodyEditorProps) => {
  const [stringifiedBodyFromEditor, setStringifiedBodyFromEditor] = useState<
    string | null
  >(activity.body);

  const [activityTitleHasBeenSet, setActivityTitleHasBeenSet] = useRecoilState(
    activityTitleHasBeenSetFamilyState({
      activityId: activity.id,
    }),
  );

  const { objectMetadataItem: objectMetadataItemActivity } =
    useObjectMetadataItemOnly({
      objectNameSingular: CoreObjectNameSingular.Activity,
    });

  const modifyActivityFromCache = useModifyRecordFromCache({
    objectMetadataItem: objectMetadataItemActivity,
  });
  const {
    goBackToPreviousHotkeyScope,
    setHotkeyScopeAndMemorizePreviousScope,
  } = usePreviousHotkeyScope();

  const { upsertActivity } = useUpsertActivity();

  const persistBodyDebounced = useDebouncedCallback((newBody: string) => {
    upsertActivity({
      activity,
      input: {
        body: newBody,
      },
    });
  }, 500);

  const persistTitleAndBodyDebounced = useDebouncedCallback(
    (newTitle: string, newBody: string) => {
      upsertActivity({
        activity,
        input: {
          title: newTitle,
          body: newBody,
        },
      });

      setActivityTitleHasBeenSet(true);
    },
    500,
  );

  const updateTitleAndBody = useCallback(
    (newStringifiedBody: string) => {
      const blockBody = JSON.parse(newStringifiedBody);
      const newTitleFromBody = blockBody[0]?.content?.[0]?.text;

      modifyActivityFromCache(activity.id, {
        title: () => {
          return newTitleFromBody;
        },
      });

      persistTitleAndBodyDebounced(newTitleFromBody, newStringifiedBody);
    },
    [activity.id, modifyActivityFromCache, persistTitleAndBodyDebounced],
  );

  const handleBodyChange = useCallback(
    (activityBody: string) => {
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
    ],
  );

  useEffect(() => {
    if (
      isNonEmptyString(stringifiedBodyFromEditor) &&
      activity.body !== stringifiedBodyFromEditor
    ) {
      handleBodyChange(stringifiedBodyFromEditor);
    }
  }, [stringifiedBodyFromEditor, handleBodyChange, activity]);

  const slashMenuItems = getSlashMenu();

  const [uploadFile] = useUploadFileMutation();

  const handleUploadAttachment = async (file: File): Promise<string> => {
    if (!file) {
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

  const editor: BlockNoteEditor<typeof blockSpecs> | null = useBlockNote({
    initialContent:
      isNonEmptyString(activity.body) && activity.body !== '{}'
        ? JSON.parse(activity.body)
        : undefined,
    domAttributes: { editor: { class: 'editor' } },
    onEditorContentChange: (editor: BlockNoteEditor) => {
      setStringifiedBodyFromEditor(JSON.stringify(editor.topLevelBlocks) ?? '');
    },
    slashMenuItems,
    blockSpecs: blockSpecs,
    uploadFile: handleUploadAttachment,
    onEditorReady: (editor: BlockNoteEditor) => {
      editor.domElement.addEventListener('paste', handleImagePaste);
    },
  });

  const handleImagePaste = async (event: ClipboardEvent) => {
    const clipboardItems = event.clipboardData?.items;

    if (clipboardItems) {
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

          if (isImage) {
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
        currentBlockContent &&
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
        currentBlockContent &&
        isArray(currentBlockContent) &&
        currentBlockContent[0] &&
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
        type: 'paragraph',
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
    <StyledBlockNoteStyledContainer onClick={() => editor.focus()}>
      <BlockEditor
        onFocus={handleBlockEditorFocus}
        onBlur={handlerBlockEditorBlur}
        editor={editor}
      />
    </StyledBlockNoteStyledContainer>
  );
};

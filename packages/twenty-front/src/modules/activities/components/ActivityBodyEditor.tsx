import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { BlockNoteEditor } from '@blocknote/core';
import { useBlockNote } from '@blocknote/react';
import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import debounce from 'lodash.debounce';
import { useRecoilValue } from 'recoil';
import { Key } from 'ts-key-enum';

import { activityEditorAnyFieldInFocusState } from '@/activities/states/activityEditorFieldFocusState';
import { Activity } from '@/activities/types/Activity';
import { ActivityEditorHotkeyScope } from '@/activities/types/ActivityEditorHotkeyScope';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { BlockEditor } from '@/ui/input/editor/components/BlockEditor';
import { RightDrawerHotkeyScope } from '@/ui/layout/right-drawer/types/RightDrawerHotkeyScope';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { isNonTextWritingKey } from '@/ui/utilities/hotkey/utils/isNonTextWritingKey';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { FileFolder, useUploadFileMutation } from '~/generated/graphql';

import { blockSpecs } from '../blocks/blockSpecs';
import { getSlashMenu } from '../blocks/slashMenu';
import { getFileType } from '../files/utils/getFileType';

const StyledBlockNoteStyledContainer = styled.div`
  width: 100%;
`;

type ActivityBodyEditorProps = {
  activity: Pick<Activity, 'id' | 'body'>;
  onChange?: (activityBody: string) => void;
  containerClassName?: string;
  onFocus?: () => void;
  onBlur?: () => void;
};

export const ActivityBodyEditor = ({
  activity,
  onChange,
  containerClassName,
  onFocus,
  onBlur,
}: ActivityBodyEditorProps) => {
  const [body, setBody] = useState<string | null>(null);
  const { updateOneRecord } = useUpdateOneRecord({
    objectNameSingular: CoreObjectNameSingular.Activity,
  });
  const editorRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const containerId = useId();
  const {
    goBackToPreviousHotkeyScope,
    setHotkeyScopeAndMemorizePreviousScope,
  } = usePreviousHotkeyScope();
  const activityEditorAnyFieldInFocus = useRecoilValue(
    activityEditorAnyFieldInFocusState,
  );

  useEffect(() => {
    if (body) {
      onChange?.(body);
    }
  }, [body, onChange]);

  const debounceOnChange = useMemo(() => {
    const onInternalChange = (activityBody: string) => {
      setBody(activityBody);
      updateOneRecord?.({
        idToUpdate: activity.id,
        updateOneRecordInput: {
          body: activityBody,
        },
      });
    };

    return debounce(onInternalChange, 200);
  }, [updateOneRecord, activity.id]);

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
      debounceOnChange(JSON.stringify(editor.topLevelBlocks) ?? '');
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

  useListenClickOutside({
    refs: [editorRef],
    callback: (event) => {
      if (
        (event.target as HTMLDivElement)?.id === containerId &&
        !activityEditorAnyFieldInFocus
      ) {
        editor.focus();
      }
    },
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
      if (keyboardEvent.key !== Key.Escape) {
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
        const currentBlockContent = blockIdentifier?.content?.[0];
        const currentTextInsideTheBlock =
          currentBlockContent?.type === 'text' ? currentBlockContent?.text : '';

        editor.updateBlock(blockIdentifier, {
          content: currentTextInsideTheBlock + keyboardEvent.key,
        });
        editor.setTextCursorPosition(blockIdentifier, 'end');
        editor.focus();
      }
    },
    RightDrawerHotkeyScope.RightDrawer,
  );

  const handleBlockEditorFocus = () => {
    setHotkeyScopeAndMemorizePreviousScope(
      ActivityEditorHotkeyScope.ActivityBody,
    );
    onFocus?.();
  };

  const handlerBlockEditorBlur = () => {
    goBackToPreviousHotkeyScope();
    onBlur?.();
  };

  return (
    <StyledBlockNoteStyledContainer
      ref={containerRef}
      id={containerId}
      className={containerClassName}
    >
      <BlockEditor
        onFocus={handleBlockEditorFocus}
        onBlur={handlerBlockEditorBlur}
        editorRef={editorRef}
        editor={editor}
      />
    </StyledBlockNoteStyledContainer>
  );
};

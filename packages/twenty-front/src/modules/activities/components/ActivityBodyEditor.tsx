import { useEffect, useMemo, useState } from 'react';
import { BlockNoteEditor } from '@blocknote/core';
import { useBlockNote } from '@blocknote/react';
import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import debounce from 'lodash.debounce';

import { Activity } from '@/activities/types/Activity';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { BlockEditor } from '@/ui/input/editor/components/BlockEditor';
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
};

export const ActivityBodyEditor = ({
  activity,
  onChange,
}: ActivityBodyEditorProps) => {
  const [body, setBody] = useState<string | null>(null);
  const { updateOneRecord } = useUpdateOneRecord({
    objectNameSingular: CoreObjectNameSingular.Activity,
  });

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

  return (
    <StyledBlockNoteStyledContainer>
      <BlockEditor editor={editor} />
    </StyledBlockNoteStyledContainer>
  );
};

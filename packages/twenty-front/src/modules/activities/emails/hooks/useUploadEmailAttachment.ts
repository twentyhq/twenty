import { useLingui } from '@lingui/react/macro';
import { type EmailAttachment } from 'twenty-shared/types';

import { MAX_ATTACHMENT_SIZE } from '@/advanced-text-editor/utils/maxAttachmentSize';
import { useDirectFileUpload } from '@/file/hooks/useDirectFileUpload';
import { formatFileSize } from '@/file/utils/formatFileSize';
import { useToast } from 'twenty-ui/feedback';
import { FileFolder } from '~/generated-metadata/graphql';
import { logError } from '~/utils/logError';

export const useUploadEmailAttachment = () => {
  const { uploadFile: directUploadFile } = useDirectFileUpload();
  const { add: addToast } = useToast();
  const { t } = useLingui();

  const uploadEmailAttachment = async (
    file: File,
  ): Promise<EmailAttachment | null> => {
    try {
      if (file.size > MAX_ATTACHMENT_SIZE) {
        const fileName = file.name;
        const maxUploadSize = formatFileSize(MAX_ATTACHMENT_SIZE);

        addToast({
          variant: 'error',
          children: t`File "${fileName}" exceeds ${maxUploadSize}`,
        });

        return null;
      }

      const uploadedFile = await directUploadFile(file, {
        fileFolder: FileFolder.EmailAttachment,
      });

      const attachment: EmailAttachment = {
        id: uploadedFile.id,
        name: file.name,
      };

      const fileName = file.name;

      addToast({
        variant: 'success',
        children: t`File "${fileName}" uploaded successfully`,
      });

      return attachment;
    } catch (error) {
      logError(`Failed to upload email attachment "${file.name}": ${error}`);

      const fileNameForError = file.name;

      addToast({
        variant: 'error',
        children: t`Failed to upload "${fileNameForError}"`,
      });

      return null;
    }
  };

  return { uploadEmailAttachment };
};

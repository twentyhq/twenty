import { useLingui } from '@lingui/react/macro';
import { type EmailAttachment } from 'twenty-shared/types';

import { MAX_ATTACHMENT_SIZE } from '@/advanced-text-editor/utils/maxAttachmentSize';
import { useDirectFileUpload } from '@/file/hooks/useDirectFileUpload';
import { formatFileSize } from '@/file/utils/formatFileSize';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { FileFolder } from '~/generated-metadata/graphql';
import { logError } from '~/utils/logError';

export const useUploadEmailAttachment = () => {
  const { uploadFile: directUploadFile } = useDirectFileUpload();
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const { t } = useLingui();

  const uploadEmailAttachment = async (
    file: File,
  ): Promise<EmailAttachment | null> => {
    try {
      if (file.size > MAX_ATTACHMENT_SIZE) {
        const fileName = file.name;
        const maxUploadSize = formatFileSize(MAX_ATTACHMENT_SIZE);

        enqueueErrorSnackBar({
          message: t`File "${fileName}" exceeds ${maxUploadSize}`,
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

      enqueueSuccessSnackBar({
        message: t`File "${fileName}" uploaded successfully`,
      });

      return attachment;
    } catch (error) {
      logError(`Failed to upload email attachment "${file.name}": ${error}`);

      const fileNameForError = file.name;

      enqueueErrorSnackBar({
        message: t`Failed to upload "${fileNameForError}"`,
      });

      return null;
    }
  };

  return { uploadEmailAttachment };
};

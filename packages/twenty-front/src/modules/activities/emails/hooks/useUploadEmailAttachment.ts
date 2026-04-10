import { useMutation } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { type EmailAttachment } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { MAX_ATTACHMENT_SIZE } from '@/advanced-text-editor/utils/maxAttachmentSize';
import { UPLOAD_EMAIL_ATTACHMENT_FILE } from '@/file/graphql/mutations/uploadEmailAttachmentFile';
import { formatFileSize } from '@/file/utils/formatFileSize';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import {
  type UploadEmailAttachmentFileMutation,
  type UploadEmailAttachmentFileMutationVariables,
} from '~/generated-metadata/graphql';
import { logError } from '~/utils/logError';

export const useUploadEmailAttachment = () => {
  const [uploadEmailAttachmentFileMutation] = useMutation<
    UploadEmailAttachmentFileMutation,
    UploadEmailAttachmentFileMutationVariables
  >(UPLOAD_EMAIL_ATTACHMENT_FILE);
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

      const result = await uploadEmailAttachmentFileMutation({
        variables: { file },
      });

      const uploadedFile = result?.data?.uploadEmailAttachmentFile;

      if (!isDefined(uploadedFile)) {
        throw new Error('File upload failed');
      }

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

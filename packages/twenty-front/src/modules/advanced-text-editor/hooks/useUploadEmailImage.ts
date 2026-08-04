import { t } from '@lingui/core/macro';
import { EMAIL_IMAGE_MIME_TYPES } from 'twenty-shared/constants';
import { FileFolder } from '~/generated-metadata/graphql';

import { type UploadedImage } from '@/advanced-text-editor/types/UploadedImage';
import { MAX_ATTACHMENT_SIZE } from '@/advanced-text-editor/utils/maxAttachmentSize';
import { formatFileSize } from '@/file/utils/formatFileSize';
import { useDirectFileUpload } from '@/file/hooks/useDirectFileUpload';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { logError } from '~/utils/logError';

// Inline email images are fetched by recipients' mail clients long after the
// authoring session, so return both their durable identity and non-expiring
// delivery URL.
export const useUploadEmailImage = () => {
  const { uploadFile } = useDirectFileUpload();
  const { enqueueErrorSnackBar } = useSnackBar();

  const uploadEmailImage = async (file: File): Promise<UploadedImage> => {
    if (
      !EMAIL_IMAGE_MIME_TYPES.includes(
        file.type as (typeof EMAIL_IMAGE_MIME_TYPES)[number],
      )
    ) {
      enqueueErrorSnackBar({ message: t`Unsupported image format` });

      throw new Error(`Unsupported email image MIME type: ${file.type}`);
    }

    if (file.size > MAX_ATTACHMENT_SIZE) {
      const fileName = file.name;
      const maxUploadSize = formatFileSize(MAX_ATTACHMENT_SIZE);

      enqueueErrorSnackBar({
        message: t`Image "${fileName}" exceeds ${maxUploadSize}`,
      });

      throw new Error('Email image exceeds the maximum upload size');
    }

    try {
      const uploadedFile = await uploadFile(file, {
        fileFolder: FileFolder.EmailImage,
      });

      return { fileId: uploadedFile.id, url: uploadedFile.url };
    } catch (error) {
      const fileName = file.name;

      logError(`Failed to upload email image "${fileName}": ${error}`);
      enqueueErrorSnackBar({ message: t`Failed to upload "${fileName}"` });

      throw error;
    }
  };

  return { uploadEmailImage };
};

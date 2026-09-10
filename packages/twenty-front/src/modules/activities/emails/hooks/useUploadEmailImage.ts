import { t } from '@lingui/core/macro';
import { EMAIL_IMAGE_MIME_TYPES } from 'twenty-shared/constants';
import { FileFolder } from '~/generated-metadata/graphql';

import { type UploadedImage } from '@/advanced-text-editor/types/UploadedImage';
import { MAX_ATTACHMENT_SIZE } from '@/advanced-text-editor/utils/maxAttachmentSize';
import { useDirectFileUpload } from '@/file/hooks/useDirectFileUpload';
import { formatFileSize } from '@/file/utils/formatFileSize';
import { useToast } from 'twenty-ui/feedback';
import { logError } from '~/utils/logError';

export const useUploadEmailImage = () => {
  const { uploadFile } = useDirectFileUpload();
  const { enqueueToast } = useToast();

  const uploadEmailImage = async (file: File): Promise<UploadedImage> => {
    if (
      !EMAIL_IMAGE_MIME_TYPES.includes(
        file.type as (typeof EMAIL_IMAGE_MIME_TYPES)[number],
      )
    ) {
      enqueueToast({ variant: 'error', children: t`Unsupported image format` });

      throw new Error(`Unsupported email image MIME type: ${file.type}`);
    }

    if (file.size > MAX_ATTACHMENT_SIZE) {
      const fileName = file.name;
      const maxUploadSize = formatFileSize(MAX_ATTACHMENT_SIZE);

      enqueueToast({
        variant: 'error',
        children: t`Image "${fileName}" exceeds ${maxUploadSize}`,
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
      enqueueToast({
        variant: 'error',
        children: t`Failed to upload "${fileName}"`,
      });

      throw error;
    }
  };

  return { uploadEmailImage };
};

import { t } from '@lingui/core/macro';
import { FileFolder } from '~/generated-metadata/graphql';

import { MAX_ATTACHMENT_SIZE } from '@/advanced-text-editor/utils/maxAttachmentSize';
import { formatFileSize } from '@/file/utils/formatFileSize';
import { useDirectFileUpload } from '@/file/hooks/useDirectFileUpload';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { logError } from '~/utils/logError';

// Campaign images are fetched by recipients' mail clients, so the upload
// returns the absolute, non-expiring signed URL of the CampaignImage folder.
export const useUploadCampaignImage = () => {
  const { uploadFile } = useDirectFileUpload();
  const { enqueueErrorSnackBar } = useSnackBar();

  const uploadCampaignImage = async (file: File): Promise<string> => {
    if (file.size > MAX_ATTACHMENT_SIZE) {
      const fileName = file.name;
      const maxUploadSize = formatFileSize(MAX_ATTACHMENT_SIZE);

      enqueueErrorSnackBar({
        message: t`Image "${fileName}" exceeds ${maxUploadSize}`,
      });

      throw new Error('Campaign image exceeds the maximum upload size');
    }

    try {
      const uploadedFile = await uploadFile(file, {
        fileFolder: FileFolder.CampaignImage,
      });

      return uploadedFile.url;
    } catch (error) {
      const fileName = file.name;

      logError(`Failed to upload campaign image "${fileName}": ${error}`);
      enqueueErrorSnackBar({ message: t`Failed to upload "${fileName}"` });

      throw error;
    }
  };

  return { uploadCampaignImage };
};

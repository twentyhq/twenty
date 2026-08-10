import { type EmailAttachment } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { useUploadEmailAttachment } from '@/activities/emails/hooks/useUploadEmailAttachment';
import { useFileUpload } from '@/file-upload/hooks/useFileUpload';

type UseAttachEmailFilesArgs = {
  files: EmailAttachment[];
  onChange: (files: EmailAttachment[]) => void;
};

export const useAttachEmailFiles = ({
  files,
  onChange,
}: UseAttachEmailFilesArgs) => {
  const { uploadEmailAttachment } = useUploadEmailAttachment();
  const { openFileUpload } = useFileUpload();

  const handleUploadFiles = async (filesToUpload: File[]) => {
    const uploadedFiles = await Promise.all(
      filesToUpload.map((file) => uploadEmailAttachment(file)),
    );

    const successfulUploads = uploadedFiles.filter(isDefined);

    if (successfulUploads.length > 0) {
      onChange([...files, ...successfulUploads]);
    }
  };

  const openAttachmentPicker = () => {
    openFileUpload({ multiple: true, onUpload: handleUploadFiles });
  };

  return { openAttachmentPicker };
};

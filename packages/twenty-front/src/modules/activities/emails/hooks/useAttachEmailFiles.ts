import { type Dispatch, type SetStateAction } from 'react';
import { type EmailAttachment } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { useUploadEmailAttachment } from '@/activities/emails/hooks/useUploadEmailAttachment';
import { useFileUpload } from '@/file-upload/hooks/useFileUpload';

type UseAttachEmailFilesArgs = {
  onFilesAttached: Dispatch<SetStateAction<EmailAttachment[]>>;
};

export const useAttachEmailFiles = ({
  onFilesAttached,
}: UseAttachEmailFilesArgs) => {
  const { uploadEmailAttachment } = useUploadEmailAttachment();
  const { openFileUpload } = useFileUpload();

  const handleUploadFiles = async (filesToUpload: File[]) => {
    const uploadedFiles = await Promise.all(
      filesToUpload.map((file) => uploadEmailAttachment(file)),
    );

    const successfulUploads = uploadedFiles.filter(isDefined);

    if (successfulUploads.length === 0) {
      return;
    }

    // Appended against the latest state rather than the list captured when the
    // picker opened: an upload can finish after the user has removed or added
    // other attachments.
    onFilesAttached((previousFiles) => [
      ...previousFiles,
      ...successfulUploads,
    ]);
  };

  const openAttachmentPicker = () => {
    openFileUpload({ multiple: true, onUpload: handleUploadFiles });
  };

  return { openAttachmentPicker };
};

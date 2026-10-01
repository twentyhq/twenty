import { type Dispatch, type SetStateAction, useState } from 'react';
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
  const [pendingUploadCount, setPendingUploadCount] = useState(0);

  const handleUploadFiles = async (filesToUpload: File[]) => {
    setPendingUploadCount((count) => count + 1);

    try {
      await appendUploadedFiles(filesToUpload);
    } finally {
      setPendingUploadCount((count) => count - 1);
    }
  };

  const appendUploadedFiles = async (filesToUpload: File[]) => {
    const uploadedFiles = await Promise.all(
      filesToUpload.map((file) => uploadEmailAttachment(file)),
    );

    const successfulUploads = uploadedFiles.filter(isDefined);

    if (successfulUploads.length === 0) {
      return;
    }

    // An upload can finish after the user changed the attachments, so append to the latest state.
    onFilesAttached((previousFiles) => [
      ...previousFiles,
      ...successfulUploads,
    ]);
  };

  const openAttachmentPicker = () => {
    openFileUpload({ multiple: true, onUpload: handleUploadFiles });
  };

  // Attachments join the draft only once uploaded, so sending must wait for them.
  return {
    openAttachmentPicker,
    isUploadingAttachments: pendingUploadCount > 0,
  };
};

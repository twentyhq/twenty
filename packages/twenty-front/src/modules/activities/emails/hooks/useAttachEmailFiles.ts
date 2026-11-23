import { atom, useStore } from 'jotai';
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
  const [uploadGenerationAtom] = useState(() => atom(0));
  const store = useStore();

  const handleUploadFiles = async (filesToUpload: File[]) => {
    setPendingUploadCount((count) => count + 1);

    try {
      await appendUploadedFiles(filesToUpload);
    } finally {
      setPendingUploadCount((count) => count - 1);
    }
  };

  const appendUploadedFiles = async (filesToUpload: File[]) => {
    const uploadGeneration = store.get(uploadGenerationAtom);

    const uploadedFiles = await Promise.all(
      filesToUpload.map((file) => uploadEmailAttachment(file)),
    );

    const successfulUploads = uploadedFiles.filter(isDefined);

    if (
      successfulUploads.length === 0 ||
      uploadGeneration !== store.get(uploadGenerationAtom)
    ) {
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

  const discardPendingUploads = () => {
    store.set(uploadGenerationAtom, (uploadGeneration) => uploadGeneration + 1);
  };

  // Attachments join the draft only once uploaded, so sending must wait for them.
  return {
    openAttachmentPicker,
    discardPendingUploads,
    isUploadingAttachments: pendingUploadCount > 0,
  };
};

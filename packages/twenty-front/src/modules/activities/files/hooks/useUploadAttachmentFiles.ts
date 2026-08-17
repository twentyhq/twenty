import { useUploadAttachmentFile } from '@/activities/files/hooks/useUploadAttachmentFile';
import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';

export const useUploadAttachmentFiles = () => {
  const { uploadAttachmentFile } = useUploadAttachmentFile();

  const uploadAttachmentFiles = async (
    files: File[],
    targetableObject: ActivityTargetableObject,
  ) => {
    for (const file of files) {
      await uploadAttachmentFile(file, targetableObject);
    }
  };

  return { uploadAttachmentFiles };
};

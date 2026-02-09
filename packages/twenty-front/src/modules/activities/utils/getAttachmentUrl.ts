import { type Attachment } from '@/activities/files/types/Attachment';

export const getAttachmentUrl = (
  attachment: Attachment,
  isFilesFieldMigrated: boolean,
): string => {
  if (isFilesFieldMigrated) {
    return attachment.file?.[0]?.url ?? '';
  }

  return attachment.fullPath;
};

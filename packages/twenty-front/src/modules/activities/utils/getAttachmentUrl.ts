import { type Attachment } from '@/activities/files/types/Attachment';
import { isDefined } from 'twenty-shared/utils';

// Get the URL from an attachment, handling both FILES field and legacy fullPath
export const getAttachmentUrl = (
  attachment: Attachment,
  isFilesFieldMigrated: boolean,
): string => {
  if (isFilesFieldMigrated) {
    // FILES field migration: use file[0].url
    return attachment.file?.[0]?.url ?? '';
  }

  // Legacy: use fullPath
  return attachment.fullPath;
};

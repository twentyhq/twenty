import { type Attachment } from '@/activities/files/types/Attachment';

export const getAttachmentUrl = ({
  attachment,
  isFilesFieldMigrated,
}: {
  attachment: Attachment;
  isFilesFieldMigrated: boolean;
}): string => {
  if (isFilesFieldMigrated) {
    //TODO : add minimumFile settings + set it for attachment.file files field + exception invariance check here
    return attachment.file?.[0]?.url as string;
  }

  return attachment.fullPath as string;
};

import { type AttachmentWithFile } from '@/activities/files/utils/filterAttachmentsWithFile';

export const getAttachmentUrl = ({
  attachment,
}: {
  attachment: AttachmentWithFile;
}): string => {
  return attachment.file.url;
};

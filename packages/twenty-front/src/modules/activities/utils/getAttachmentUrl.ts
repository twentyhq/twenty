import { type AttachmentWithFile } from '@/activities/files/utils/filterAttachmentsWithFile';

export const getAttachmentUrl = ({
  attachment,
}: {
  attachment: AttachmentWithFile;
}): string | undefined => {
  return attachment.file[0]?.url;
};

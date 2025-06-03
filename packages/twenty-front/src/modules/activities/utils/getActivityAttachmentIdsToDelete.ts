import { Attachment } from '@/activities/files/types/Attachment';

export const getActivityAttachmentIdsToDelete = (
  newActivityBody: string,
  oldActivityAttachments: Attachment[] = [],
) => {
  if (oldActivityAttachments.length === 0) return [];

  return oldActivityAttachments
    .filter(
      (attachment) =>
        !newActivityBody.includes(attachment.fullPath.split('?')[0]),
    )
    .map((attachment) => attachment.id);
};

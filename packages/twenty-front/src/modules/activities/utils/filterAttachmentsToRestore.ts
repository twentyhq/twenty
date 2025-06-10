import { Attachment } from '@/activities/files/types/Attachment';
import { getAttachmentPath } from '@/activities/utils/getAttachmentPath';

export const filterAttachmentsToRestore = (
  attachmentPathsToRestore: string[],
  softDeletedAttachments: Attachment[],
) => {
  return softDeletedAttachments
    .filter((attachment) =>
      attachmentPathsToRestore.some(
        (path) => getAttachmentPath(attachment.fullPath) === path,
      ),
    )
    .map((attachment) => attachment.id);
};

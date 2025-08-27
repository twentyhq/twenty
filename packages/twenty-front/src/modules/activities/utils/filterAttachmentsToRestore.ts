import { type Attachment } from '@/activities/files/types/Attachment';
import { compareUrls } from '@/activities/utils/compareUrls';

export const filterAttachmentsToRestore = (
  attachmentPathsToRestore: string[],
  softDeletedAttachments: Attachment[],
) => {
  return softDeletedAttachments
    .filter((attachment) =>
      attachmentPathsToRestore.some((path) =>
        compareUrls(attachment.fullPath, path),
      ),
    )
    .map((attachment) => attachment.id);
};

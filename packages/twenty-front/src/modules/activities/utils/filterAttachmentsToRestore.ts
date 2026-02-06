import { type Attachment } from '@/activities/files/types/Attachment';
import { getAttachmentUrl } from '@/activities/utils/getAttachmentUrl';
import { compareUrls } from '@/activities/utils/compareUrls';

export const filterAttachmentsToRestore = (
  attachmentPathsToRestore: string[],
  softDeletedAttachments: Attachment[],
  isFilesFieldMigrated: boolean,
) => {
  return softDeletedAttachments
    .filter((attachment) =>
      attachmentPathsToRestore.some((path) =>
        compareUrls(getAttachmentUrl(attachment, isFilesFieldMigrated), path),
      ),
    )
    .map((attachment) => attachment.id);
};

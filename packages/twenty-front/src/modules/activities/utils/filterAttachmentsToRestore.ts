import { type Attachment } from '@/activities/files/types/Attachment';
import { compareUrls } from '@/activities/utils/compareUrls';
import { getAttachmentUrl } from '@/activities/utils/getAttachmentUrl';

export const filterAttachmentsToRestore = ({
  attachmentPathsToRestore,
  softDeletedAttachments,
  isFilesFieldMigrated,
}: {
  attachmentPathsToRestore: string[];
  softDeletedAttachments: Attachment[];
  isFilesFieldMigrated: boolean;
}) => {
  return softDeletedAttachments
    .filter((attachment) =>
      attachmentPathsToRestore.some((path) =>
        compareUrls(
          getAttachmentUrl({ attachment, isFilesFieldMigrated }),
          path,
        ),
      ),
    )
    .map((attachment) => attachment.id);
};

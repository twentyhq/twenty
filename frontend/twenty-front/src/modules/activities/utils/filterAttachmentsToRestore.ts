import { type Attachment } from '@/activities/files/types/Attachment';
import { filterAttachmentsWithFile } from '@/activities/files/utils/filterAttachmentsWithFile';
import { compareUrls } from '@/activities/utils/compareUrls';
import { getAttachmentUrl } from '@/activities/utils/getAttachmentUrl';

export const filterAttachmentsToRestore = ({
  attachmentPathsToRestore,
  softDeletedAttachments,
}: {
  attachmentPathsToRestore: string[];
  softDeletedAttachments: Attachment[];
}) => {
  return filterAttachmentsWithFile(softDeletedAttachments)
    .filter((attachment) =>
      attachmentPathsToRestore.some((path) =>
        compareUrls(getAttachmentUrl({ attachment }), path),
      ),
    )
    .map((attachment) => attachment.id);
};

import { type Attachment } from '@/activities/files/types/Attachment';
import { filterAttachmentsWithFile } from '@/activities/files/utils/filterAttachmentsWithFile';
import { compareUrls } from '@/activities/utils/compareUrls';
import { getActivityAttachmentPathsAndName } from '@/activities/utils/getActivityAttachmentPathsAndName';
import { getAttachmentUrl } from '@/activities/utils/getAttachmentUrl';

export const getActivityAttachmentPathsToRestore = (
  newActivityBody: string,
  oldActivityAttachments: Attachment[],
) => {
  const newActivityAttachmentPaths =
    getActivityAttachmentPathsAndName(newActivityBody);

  const attachmentsWithFile = filterAttachmentsWithFile(oldActivityAttachments);

  const pathsToRestore = newActivityAttachmentPaths
    .filter(
      (newActivity) =>
        !attachmentsWithFile.some((attachment) =>
          compareUrls(newActivity.path, getAttachmentUrl({ attachment })),
        ),
    )
    .map((activity) => activity.path);

  return pathsToRestore;
};

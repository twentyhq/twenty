import { type Attachment } from '@/activities/files/types/Attachment';
import { compareUrls } from '@/activities/utils/compareUrls';
import { getActivityAttachmentPathsAndName } from '@/activities/utils/getActivityAttachmentPathsAndName';

export const getActivityAttachmentPathsToRestore = (
  newActivityBody: string,
  oldActivityAttachments: Attachment[],
) => {
  const newActivityAttachmentPaths =
    getActivityAttachmentPathsAndName(newActivityBody);

  const pathsToRestore = newActivityAttachmentPaths
    .filter(
      (newActivity) =>
        !oldActivityAttachments.some((attachment) =>
          compareUrls(newActivity.path, attachment.fullPath),
        ),
    )
    .map((activity) => activity.path);

  return pathsToRestore;
};

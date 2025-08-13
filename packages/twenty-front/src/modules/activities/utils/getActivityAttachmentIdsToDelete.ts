import { type Attachment } from '@/activities/files/types/Attachment';
import { compareUrls } from '@/activities/utils/compareUrls';
import { getActivityAttachmentPathsAndName } from '@/activities/utils/getActivityAttachmentPathsAndName';

export const getActivityAttachmentIdsToDelete = (
  newActivityBody: string,
  oldActivityAttachments: Attachment[] = [],
  oldActivityBody: string,
) => {
  if (oldActivityAttachments.length === 0) return [];

  const newActivityAttachmentPaths =
    getActivityAttachmentPathsAndName(newActivityBody);

  const oldActivityAttachmentPaths =
    getActivityAttachmentPathsAndName(oldActivityBody);

  const pathsToDelete = oldActivityAttachmentPaths
    .filter(
      (oldActivity) =>
        !newActivityAttachmentPaths.some(
          (newActivity) => newActivity.path === oldActivity.path,
        ),
    )
    .map((activity) => activity.path);

  return oldActivityAttachments
    .filter((attachment) =>
      pathsToDelete.some((pathToDelete) =>
        compareUrls(attachment.fullPath, pathToDelete),
      ),
    )
    .map((attachment) => attachment.id);
};

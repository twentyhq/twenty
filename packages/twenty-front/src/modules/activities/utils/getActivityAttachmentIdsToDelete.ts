import { Attachment } from '@/activities/files/types/Attachment';
import { getActivityAttachmentPathsAndName } from '@/activities/utils/getActivityAttachmentPathsAndName';
import { getAttachmentPath } from '@/activities/utils/getAttachmentPath';

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
      pathsToDelete.includes(getAttachmentPath(attachment.fullPath)),
    )
    .map((attachment) => attachment.id);
};

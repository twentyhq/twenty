import { Attachment } from '@/activities/files/types/Attachment';
import { getActivityAttachmentPathsAndName } from '@/activities/utils/getActivityAttachmentPathsAndName';
import { getAttachmentPath } from '@/activities/utils/getAttachmentPath';

export const getActivityAttachmentPathsToRestore = (
  newActivityBody: string,
  oldActivityAttachments: Attachment[],
) => {
  const newActivityAttachmentPaths =
    getActivityAttachmentPathsAndName(newActivityBody);

  const pathsToRestore = newActivityAttachmentPaths
    .filter(
      (newActivity) =>
        !oldActivityAttachments.some(
          (attachment) =>
            newActivity.path === getAttachmentPath(attachment.fullPath),
        ),
    )
    .map((activity) => activity.path);

  return pathsToRestore;
};

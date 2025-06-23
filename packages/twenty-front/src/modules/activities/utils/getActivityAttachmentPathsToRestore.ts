import { Attachment } from '@/activities/files/types/Attachment';
import { getActivityAttachmentPaths } from '@/activities/utils/getActivityAttachmentPaths';
import { getAttachmentPath } from '@/activities/utils/getAttachmentPath';

export const getActivityAttachmentPathsToRestore = (
  newActivityBody: string,
  oldActivityAttachments: Attachment[],
) => {
  const newActivityAttachmentPaths =
    getActivityAttachmentPaths(newActivityBody);

  return newActivityAttachmentPaths.filter((fullPath) =>
    oldActivityAttachments.every(
      (attachment) => getAttachmentPath(attachment.fullPath) !== fullPath,
    ),
  );
};

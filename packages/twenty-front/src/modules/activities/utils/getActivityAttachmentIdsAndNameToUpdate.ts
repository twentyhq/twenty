import { Attachment } from '@/activities/files/types/Attachment';
import {
  AttachmentInfo,
  getActivityAttachmentPathsAndName,
} from '@/activities/utils/getActivityAttachmentPathsAndName';
import { getAttachmentPath } from '@/activities/utils/getAttachmentPath';
import { isDefined } from 'twenty-shared/utils';

export const getActivityAttachmentIdsAndNameToUpdate = (
  newActivityBody: string,
  oldActivityAttachments: Attachment[] = [],
) => {
  const activityAttachmentsNameAndPaths =
    getActivityAttachmentPathsAndName(newActivityBody);
  if (activityAttachmentsNameAndPaths.length === 0) return [];

  return activityAttachmentsNameAndPaths.reduce(
    (acc: Partial<Attachment>[], activity: AttachmentInfo) => {
      const foundActivity = oldActivityAttachments.find(
        (attachment) =>
          getAttachmentPath(attachment.fullPath) === activity.path,
      );
      if (isDefined(foundActivity) && foundActivity.name !== activity.name) {
        acc.push({ id: foundActivity.id, name: activity.name });
      }
      return acc;
    },
    [],
  );
};

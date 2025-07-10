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
  const activityAttchmentsNameAndPaths =
    getActivityAttachmentPathsAndName(newActivityBody);
  if (activityAttchmentsNameAndPaths.length === 0) return [];

  return activityAttchmentsNameAndPaths.reduce(
    (acc: Partial<Attachment>[], activity: AttachmentInfo) => {
      const foundActivity = oldActivityAttachments.find(
        (attchment) => getAttachmentPath(attchment.fullPath) === activity.path,
      );
      if (isDefined(foundActivity) && foundActivity.name !== activity.name) {
        acc.push({ id: foundActivity.id, name: activity.name });
      }
      return acc;
    },
    [],
  );
};

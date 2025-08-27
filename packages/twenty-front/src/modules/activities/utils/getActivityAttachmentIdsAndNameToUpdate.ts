import { type Attachment } from '@/activities/files/types/Attachment';
import { compareUrls } from '@/activities/utils/compareUrls';
import {
  type AttachmentInfo,
  getActivityAttachmentPathsAndName,
} from '@/activities/utils/getActivityAttachmentPathsAndName';
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
      const foundActivity = oldActivityAttachments.find((attachment) =>
        compareUrls(attachment.fullPath, activity.path),
      );
      if (isDefined(foundActivity) && foundActivity.name !== activity.name) {
        acc.push({ id: foundActivity.id, name: activity.name });
      }
      return acc;
    },
    [],
  );
};

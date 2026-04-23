import { type Attachment } from '@/activities/files/types/Attachment';
import { filterAttachmentsWithFile } from '@/activities/files/utils/filterAttachmentsWithFile';
import { compareUrls } from '@/activities/utils/compareUrls';
import {
  type AttachmentInfo,
  getActivityAttachmentPathsAndName,
} from '@/activities/utils/getActivityAttachmentPathsAndName';
import { getAttachmentUrl } from '@/activities/utils/getAttachmentUrl';
import { isDefined } from 'twenty-shared/utils';

export const getActivityAttachmentIdsAndNameToUpdate = (
  newActivityBody: string,
  oldActivityAttachments: Attachment[] = [],
) => {
  const activityAttachmentsNameAndPaths =
    getActivityAttachmentPathsAndName(newActivityBody);
  if (activityAttachmentsNameAndPaths.length === 0) return [];

  const attachmentsWithFile = filterAttachmentsWithFile(oldActivityAttachments);

  return activityAttachmentsNameAndPaths.reduce(
    (acc: Partial<Attachment>[], activity: AttachmentInfo) => {
      const foundActivity = attachmentsWithFile.find((attachment) =>
        compareUrls(getAttachmentUrl({ attachment }), activity.path),
      );
      if (isDefined(foundActivity) && foundActivity.name !== activity.name) {
        acc.push({ id: foundActivity.id, name: activity.name });
      }
      return acc;
    },
    [],
  );
};

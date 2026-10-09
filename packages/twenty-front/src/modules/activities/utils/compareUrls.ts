import { getAttachmentPath } from '@/activities/utils/getAttachmentPath';
import { isDefined } from 'twenty-shared/utils';

export const compareUrls = (
  firstAttachmentUrl: string | undefined,
  secondAttachmentUrl: string | undefined,
): boolean => {
  if (!isDefined(firstAttachmentUrl) || !isDefined(secondAttachmentUrl)) {
    return false;
  }

  try {
    const urlA = new URL(firstAttachmentUrl);
    const urlB = new URL(secondAttachmentUrl);
    if (urlA.hostname !== urlB.hostname) return false;
    return (
      getAttachmentPath(firstAttachmentUrl) ===
      getAttachmentPath(secondAttachmentUrl)
    );
  } catch {
    return firstAttachmentUrl === secondAttachmentUrl;
  }
};

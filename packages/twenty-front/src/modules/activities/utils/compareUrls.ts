import { getAttachmentPath } from '@/activities/utils/getAttachmentPath';

export const compareUrls = (
  firstAttachmentUrl: string,
  secondAttachmentUrl: string,
): boolean => {
  const urlA = new URL(firstAttachmentUrl);
  const urlB = new URL(secondAttachmentUrl);
  if (urlA.hostname !== urlB.hostname) return false;
  return (
    getAttachmentPath(firstAttachmentUrl) ===
    getAttachmentPath(secondAttachmentUrl)
  );
};

import { getAttachmentPath } from '@/activities/utils/getAttachmentPath';
import { isNonEmptyString } from '@sniptt/guards';

export type AttachmentInfo = {
  path: string;
  name: string;
};
export const getActivityAttachmentPathsAndName = (
  stringifiedActivityBlocknote: string,
): AttachmentInfo[] => {
  const activityBlocknote = JSON.parse(stringifiedActivityBlocknote ?? '{}');

  return activityBlocknote.reduce((acc: AttachmentInfo[], block: any) => {
    if (
      ['image', 'file', 'video', 'audio'].includes(block.type) &&
      isNonEmptyString(block.props.url)
    ) {
      acc.push({
        path: getAttachmentPath(block.props.url),
        name: block.props.name,
      });
    }
    return acc;
  }, []);
};

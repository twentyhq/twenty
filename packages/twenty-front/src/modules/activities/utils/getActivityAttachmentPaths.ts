import { getAttachmentPath } from '@/activities/utils/getAttachmentPath';
import { isNonEmptyString } from '@sniptt/guards';

export const getActivityAttachmentPaths = (
  stringifiedActivityBlocknote: string | null | undefined,
): string[] => {
  const activityBlocknote = JSON.parse(stringifiedActivityBlocknote ?? '{}');

  return activityBlocknote.reduce((acc: string[], block: any) => {
    if (
      ['image', 'file', 'video', 'audio'].includes(block.type) &&
      isNonEmptyString(block.props.url)
    ) {
      acc.push(getAttachmentPath(block.props.url));
    }
    return acc;
  }, []);
};

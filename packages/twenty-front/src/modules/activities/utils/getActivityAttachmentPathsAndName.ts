import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

export type AttachmentInfo = {
  path: string;
  name: string;
};
export const getActivityAttachmentPathsAndName = (
  stringifiedActivityBlocknote: string,
): AttachmentInfo[] => {
  const activityBlocknote = JSON.parse(stringifiedActivityBlocknote ?? '{}');

  return activityBlocknote.reduce(
    (
      acc: AttachmentInfo[],
      block: { type?: string; props?: { url: string; name: string } },
    ) => {
      if (
        isDefined(block.type) &&
        ['image', 'file', 'video', 'audio'].includes(block.type) &&
        isDefined(block.props?.url) &&
        isNonEmptyString(block.props.url)
      ) {
        acc.push({
          path: block.props.url,
          name: block.props.name || '',
        });
      }
      return acc;
    },
    [],
  );
};

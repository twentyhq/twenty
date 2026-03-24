import { isNonEmptyString } from '@sniptt/guards';
import { parseJson } from 'twenty-shared/utils';

export type AttachmentInfo = {
  path: string;
  name: string;
};
export const getActivityAttachmentPathsAndName = (
  stringifiedActivityBlocknote: string,
): AttachmentInfo[] => {
  const activityBlocknote = parseJson<any[]>(stringifiedActivityBlocknote) ?? [];

  return activityBlocknote.reduce((acc: AttachmentInfo[], block: any) => {
    if (
      ['image', 'file', 'video', 'audio'].includes(block.type) &&
      isNonEmptyString(block.props.url)
    ) {
      acc.push({
        path: block.props.url,
        name: block.props.name,
      });
    }
    return acc;
  }, []);
};

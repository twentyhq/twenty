import type { PartialBlock } from '@blocknote/core';
import { isNonEmptyString } from '@sniptt/guards';
import { parseJson } from 'twenty-shared/utils';

export type AttachmentInfo = {
  path: string;
  name: string;
};
export const getActivityAttachmentPathsAndName = (
  stringifiedActivityBlocknote: string,
): AttachmentInfo[] => {
  const activityBlocknote =
    parseJson<PartialBlock[]>(stringifiedActivityBlocknote) ?? [];

  return activityBlocknote.reduce(
    (acc: AttachmentInfo[], block: PartialBlock) => {
      const props = block.props as
        | { url?: string; name?: string }
        | undefined;

      if (
        block.type !== undefined &&
        ['image', 'file', 'video', 'audio'].includes(block.type) &&
        isNonEmptyString(props?.url)
      ) {
        acc.push({
          path: props.url,
          name: props?.name ?? '',
        });
      }
      return acc;
    },
    [],
  );
};

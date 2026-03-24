import { isNonEmptyString } from '@sniptt/guards';

import { parseInitialBlocknote } from '@/blocknote-editor/utils/parseInitialBlocknote';

export type AttachmentInfo = {
  path: string;
  name: string;
};

const ATTACHMENT_BLOCK_TYPES = ['image', 'file', 'video', 'audio'];

export const getActivityAttachmentPathsAndName = (
  stringifiedActivityBlocknote: string,
): AttachmentInfo[] => {
  const blocks = parseInitialBlocknote(stringifiedActivityBlocknote) ?? [];

  return blocks.reduce((acc: AttachmentInfo[], block) => {
    const props = block.props as { url?: string; name?: string } | undefined;

    if (
      block.type !== undefined &&
      ATTACHMENT_BLOCK_TYPES.includes(block.type) &&
      isNonEmptyString(props?.url)
    ) {
      acc.push({
        path: props.url,
        name: props?.name ?? '',
      });
    }
    return acc;
  }, []);
};

import { isNonEmptyString } from '@sniptt/guards';
import { TIPTAP_NODE_TYPES, type TipTapNode } from 'twenty-shared/utils';

export const collectTipTapImageSources = (node: TipTapNode): string[] => [
  ...(node.type === TIPTAP_NODE_TYPES.IMAGE && isNonEmptyString(node.attrs?.src)
    ? [node.attrs.src]
    : []),
  ...(node.content ?? []).flatMap(collectTipTapImageSources),
];

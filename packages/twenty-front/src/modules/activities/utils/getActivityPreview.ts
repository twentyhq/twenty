// TODO: merge with getFirstNonEmptyLineOfRichText (and one duplicate I saw and also added a note on)

import { isArray, isNonEmptyString } from '@sniptt/guards';
import { parseJson } from 'twenty-shared/utils';

interface BaseNode {
  type: string;
  content?: RichTextNode[];
  [key: string]: unknown;
}

interface TextNode extends BaseNode {
  type: 'text';
  text: string;
}

interface LinkNode extends BaseNode {
  type: 'link';
  href?: string;
  content?: RichTextNode[];
}

type RichTextNode = TextNode | LinkNode | BaseNode;

const isTextNode = (node: RichTextNode): node is TextNode =>
  node.type === 'text';

const isLinkNode = (node: RichTextNode): node is LinkNode =>
  node.type === 'link';

export const getActivityPreview = (activityBody: string | null): string => {
  const noteBody: RichTextNode[] = activityBody
    ? (parseJson<RichTextNode[]>(activityBody) ?? [])
    : [];

  const extractText = (node: RichTextNode | undefined | null): string => {
    if (!node) return '';

    if (isTextNode(node)) {
      return node.text ?? '';
    }

    if (isLinkNode(node)) {
      return node.content?.map(extractText).join(' ') ?? '';
    }

    if (isArray(node.content)) {
      return node.content.map(extractText).join(' ');
    }

    return '';
  };

  return noteBody.length
    ? noteBody
        .map((node) => extractText(node))
        .filter(isNonEmptyString)
        .join('\n')
    : '';
};

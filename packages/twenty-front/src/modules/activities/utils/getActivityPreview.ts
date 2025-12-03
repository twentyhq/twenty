// Basic Rich-Text Node Types
export interface BaseNode {
  type: string;
  content?: RichTextNode[];
  [key: string]: unknown;
}

export interface TextNode extends BaseNode {
  type: 'text';
  text: string;
}

export interface LinkNode extends BaseNode {
  type: 'link';
  href?: string;
  content?: RichTextNode[];
}

export type RichTextNode = TextNode | LinkNode | BaseNode;

export const getActivityPreview = (activityBody: string | null): string => {
  const noteBody: RichTextNode[] = activityBody
    ? JSON.parse(activityBody)
    : [];

  const extractText = (node: RichTextNode | undefined | null): string => {
    if (!node) return '';

    switch (node.type) {
      case 'text':
        return (node as TextNode).text ?? '';

      case 'link': {
        const linkNode = node as LinkNode;
        const innerText = (linkNode.content ?? [])
          .map(child => extractText(child))
          .join('');
        const href = linkNode.href ?? '';
        return href ? `${innerText} (${href})` : innerText;
      }

      default:
        if (Array.isArray(node.content)) {
          return node.content.map(extractText).join(' ');
        }
        return '';
    }
  };

  return noteBody.length
    ? noteBody
        .map(node => extractText(node))
        .filter(Boolean)
        .join('\n')
    : '';
};

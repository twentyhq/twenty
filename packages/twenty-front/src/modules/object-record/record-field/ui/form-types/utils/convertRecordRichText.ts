import { getInitialEditorContent } from '@/advanced-text-editor/utils/getInitialEditorContent';
import { type JSONContent } from '@tiptap/core';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

const LIST_TYPES: Record<string, string> = {
  bulletListItem: 'bulletList',
  numberedListItem: 'orderedList',
  checkListItem: 'taskList',
};

const TEXT_STYLES = ['bold', 'italic', 'underline', 'strike'] as const;

const unsupportedContent = (): never => {
  throw new Error('Unsupported record rich-text content');
};

const convertInlineContent = (
  content: unknown,
  enableVariables: boolean,
): JSONContent[] => {
  if (typeof content === 'string') {
    return (
      getInitialEditorContent(content, enableVariables).content?.[0]?.content ??
      []
    );
  }
  if (content === undefined) {
    return [];
  }
  if (!Array.isArray(content)) {
    return unsupportedContent();
  }
  return content.flatMap((item): JSONContent[] => {
    if (!isPlainObject(item)) {
      return unsupportedContent();
    }
    if (item.type === 'link' && typeof item.href === 'string') {
      return convertInlineContent(item.content, enableVariables).map(
        (node) => ({
          ...node,
          marks: [
            ...(node.marks ?? []),
            { type: 'link', attrs: { href: item.href } },
          ],
        }),
      );
    }
    if (item.type === 'text' && typeof item.text === 'string') {
      const styles = isPlainObject(item.styles) ? item.styles : {};
      if (
        Object.keys(styles).some(
          (style) => !TEXT_STYLES.some((supported) => supported === style),
        )
      ) {
        return unsupportedContent();
      }
      const marks = TEXT_STYLES.filter((style) => styles[style] === true).map(
        (type) => ({ type }),
      );
      return (
        getInitialEditorContent(item.text, enableVariables).content?.[0]
          ?.content ?? []
      ).map((node) => ({ ...node, marks }));
    }
    return unsupportedContent();
  });
};

export const convertBlockNoteToTipTap = (
  blocks: unknown[],
  enableVariables = false,
): JSONContent[] =>
  blocks
    .flatMap((block): JSONContent[] => {
      if (!isPlainObject(block)) {
        return unsupportedContent();
      }
      const props = isPlainObject(block.props) ? block.props : {};
      // Do not silently discard formatting the shared editor cannot represent.
      if (
        (props.textColor !== undefined && props.textColor !== 'default') ||
        (props.backgroundColor !== undefined &&
          props.backgroundColor !== 'default') ||
        (block.type !== 'image' &&
          props.textAlignment !== undefined &&
          props.textAlignment !== 'left')
      ) {
        return unsupportedContent();
      }
      const children = Array.isArray(block.children)
        ? convertBlockNoteToTipTap(block.children, enableVariables)
        : [];
      if (
        children.length > 0 &&
        !Object.keys(LIST_TYPES).includes(String(block.type))
      ) {
        return unsupportedContent();
      }
      const content = convertInlineContent(block.content, enableVariables);
      switch (block.type) {
        case 'paragraph':
          return [{ type: 'paragraph', content }, ...children];
        case 'heading':
          if (typeof props.level === 'number' && props.level > 3) {
            return unsupportedContent();
          }
          return [
            { type: 'heading', attrs: { level: props.level ?? 1 }, content },
            ...children,
          ];
        case 'bulletListItem':
        case 'numberedListItem':
        case 'checkListItem': {
          const isTask = block.type === 'checkListItem';
          const listType = LIST_TYPES[block.type];
          return [
            {
              type: listType,
              content: [
                {
                  type: isTask ? 'taskItem' : 'listItem',
                  ...(isTask
                    ? { attrs: { checked: props.checked === true } }
                    : {}),
                  content: [{ type: 'paragraph', content }, ...children],
                },
              ],
            },
          ];
        }
        case 'image':
          return [
            {
              type: 'image',
              attrs: {
                src: props.url,
                align: props.textAlignment ?? 'left',
                alt: props.caption ?? '',
                title: props.name ?? '',
                width: props.previewWidth ?? null,
              },
            },
            ...children,
          ];
        default:
          return unsupportedContent();
      }
    })
    .reduce<JSONContent[]>((nodes, node) => {
      const previousNode = nodes.at(-1);
      if (
        isDefined(previousNode) &&
        Object.values(LIST_TYPES).includes(node.type ?? '') &&
        previousNode.type === node.type
      ) {
        previousNode.content = [
          ...(previousNode.content ?? []),
          ...(node.content ?? []),
        ];
      } else {
        nodes.push(node);
      }
      return nodes;
    }, []);

const convertInlineNodes = (nodes: JSONContent[]): Record<string, unknown>[] =>
  nodes.map((node) => {
    if (node.type === 'hardBreak') {
      return { type: 'text', text: '\n', styles: {} };
    }
    if (node.type === 'variableTag') {
      return { type: 'text', text: node.attrs?.variable ?? '', styles: {} };
    }
    if (node.type !== 'text') {
      return unsupportedContent();
    }
    const styles = Object.fromEntries(
      (node.marks ?? [])
        .filter((mark) => TEXT_STYLES.some((style) => style === mark.type))
        .map((mark) => [mark.type, true]),
    );
    if (
      (node.marks ?? []).some(
        (mark) =>
          mark.type !== 'link' &&
          !TEXT_STYLES.some((style) => style === mark.type),
      )
    ) {
      return unsupportedContent();
    }
    const text = { type: 'text', text: node.text ?? '', styles };
    const link = node.marks?.find((mark) => mark.type === 'link');
    return link
      ? { type: 'link', href: link.attrs?.href, content: [text] }
      : text;
  });

export const convertTipTapToBlockNote = (
  nodes: JSONContent[],
): Record<string, unknown>[] =>
  nodes.flatMap((node): Record<string, unknown>[] => {
    switch (node.type) {
      case 'paragraph':
      case 'heading':
        return [
          {
            type: node.type,
            props:
              node.type === 'heading' ? { level: node.attrs?.level ?? 1 } : {},
            content: convertInlineNodes(node.content ?? []),
            children: [],
          },
        ];
      case 'bulletList':
      case 'orderedList':
      case 'taskList':
        return (node.content ?? []).map((item) => {
          const [paragraph, ...children] = item.content ?? [];
          if (paragraph?.type !== 'paragraph') {
            return unsupportedContent();
          }
          const type = Object.keys(LIST_TYPES).find(
            (blockType) => LIST_TYPES[blockType] === node.type,
          );
          return {
            type,
            props:
              node.type === 'taskList'
                ? { checked: item.attrs?.checked === true }
                : {},
            content: convertInlineNodes(paragraph.content ?? []),
            children: convertTipTapToBlockNote(children),
          };
        });
      case 'image':
        return [
          {
            type: 'image',
            props: {
              url: node.attrs?.src,
              textAlignment: node.attrs?.align ?? 'left',
              caption: node.attrs?.alt ?? '',
              name: node.attrs?.title ?? '',
              previewWidth: node.attrs?.width,
            },
            children: [],
          },
        ];
      default:
        return unsupportedContent();
    }
  });

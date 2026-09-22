import { RECORD_RICH_TEXT_TEXT_STYLES } from '@/object-record/record-field/ui/form-types/constants/RecordRichTextTextStyles';
import { TIPTAP_LIST_TYPE_TO_BLOCKNOTE_LIST_ITEM_TYPE } from '@/object-record/record-field/ui/form-types/constants/TipTapListTypeToBlockNoteListItemType';
import { throwUnsupportedRecordRichTextContent } from '@/object-record/record-field/ui/form-types/utils/throwUnsupportedRecordRichTextContent';
import { type JSONContent } from '@tiptap/core';

const isSupportedTextStyle = (markType: string | undefined) =>
  RECORD_RICH_TEXT_TEXT_STYLES.some((style) => style === markType);

const convertInlineNodes = (nodes: JSONContent[]): Record<string, unknown>[] =>
  nodes.map((node) => {
    if (node.type === 'hardBreak') {
      return { type: 'text', text: '\n', styles: {} };
    }
    if (node.type === 'variableTag') {
      return { type: 'text', text: node.attrs?.variable ?? '', styles: {} };
    }
    if (node.type !== 'text') {
      return throwUnsupportedRecordRichTextContent();
    }
    const marks = node.marks ?? [];
    if (
      marks.some(
        (mark) => mark.type !== 'link' && !isSupportedTextStyle(mark.type),
      )
    ) {
      return throwUnsupportedRecordRichTextContent();
    }
    const styles = Object.fromEntries(
      marks
        .filter((mark) => isSupportedTextStyle(mark.type))
        .map((mark) => [mark.type, true]),
    );
    const text = { type: 'text', text: node.text ?? '', styles };
    const link = marks.find((mark) => mark.type === 'link');
    return link
      ? { type: 'link', href: link.attrs?.href, content: [text] }
      : text;
  });

export const convertTipTapToBlockNote = (
  nodes: JSONContent[],
): Record<string, unknown>[] =>
  nodes.flatMap((node, nodeIndex): Record<string, unknown>[] => {
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
      case 'taskList': {
        const listItemType =
          TIPTAP_LIST_TYPE_TO_BLOCKNOTE_LIST_ITEM_TYPE[node.type];
        const start = node.attrs?.start;
        // BlockNote numbers a numbered item after another one as its
        // continuation and ignores its start, so only a block in between
        // keeps two adjacent ordered lists apart.
        const separator =
          node.type === 'orderedList' &&
          nodes[nodeIndex - 1]?.type === 'orderedList'
            ? [{ type: 'paragraph', props: {}, content: [], children: [] }]
            : [];
        const items = (node.content ?? []).map((item, index) => {
          const [paragraph, ...children] = item.content ?? [];
          if (paragraph?.type !== 'paragraph') {
            return throwUnsupportedRecordRichTextContent();
          }
          return {
            type: listItemType,
            props:
              node.type === 'taskList'
                ? { checked: item.attrs?.checked === true }
                : index === 0 && typeof start === 'number' && start !== 1
                  ? { start }
                  : {},
            content: convertInlineNodes(paragraph.content ?? []),
            children: convertTipTapToBlockNote(children),
          };
        });
        return [...separator, ...items];
      }
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
        return throwUnsupportedRecordRichTextContent();
    }
  });

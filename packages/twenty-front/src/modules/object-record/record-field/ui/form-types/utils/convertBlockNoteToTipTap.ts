import { getInitialEditorContent } from '@/advanced-text-editor/utils/getInitialEditorContent';
import { BLOCKNOTE_LIST_ITEM_TYPE_TO_TIPTAP_LIST_TYPE } from '@/object-record/record-field/ui/form-types/constants/BlockNoteListItemTypeToTipTapListType';
import { RECORD_RICH_TEXT_TEXT_STYLES } from '@/object-record/record-field/ui/form-types/constants/RecordRichTextTextStyles';
import { throwUnsupportedRecordRichTextContent } from '@/object-record/record-field/ui/form-types/utils/throwUnsupportedRecordRichTextContent';
import { type JSONContent } from '@tiptap/core';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

const isBlockNoteListItemType = (
  type: unknown,
): type is keyof typeof BLOCKNOTE_LIST_ITEM_TYPE_TO_TIPTAP_LIST_TYPE =>
  Object.keys(BLOCKNOTE_LIST_ITEM_TYPE_TO_TIPTAP_LIST_TYPE).some(
    (listItemType) => listItemType === type,
  );

const isTipTapListType = (type: unknown) =>
  Object.values(BLOCKNOTE_LIST_ITEM_TYPE_TO_TIPTAP_LIST_TYPE).some(
    (listType) => listType === type,
  );

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
    return throwUnsupportedRecordRichTextContent();
  }
  return content.flatMap((item): JSONContent[] => {
    if (!isPlainObject(item)) {
      return throwUnsupportedRecordRichTextContent();
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
          (style) =>
            !RECORD_RICH_TEXT_TEXT_STYLES.some(
              (supported) => supported === style,
            ),
        )
      ) {
        return throwUnsupportedRecordRichTextContent();
      }
      const marks = RECORD_RICH_TEXT_TEXT_STYLES.filter(
        (style) => styles[style] === true,
      ).map((type) => ({ type }));
      return (
        getInitialEditorContent(item.text, enableVariables).content?.[0]
          ?.content ?? []
      ).map((node) => ({ ...node, marks }));
    }
    return throwUnsupportedRecordRichTextContent();
  });
};

export const convertBlockNoteToTipTap = (
  blocks: unknown[],
  enableVariables: boolean,
): JSONContent[] =>
  blocks
    .flatMap((block): JSONContent[] => {
      if (!isPlainObject(block)) {
        return throwUnsupportedRecordRichTextContent();
      }
      const props = isPlainObject(block.props) ? block.props : {};
      if (
        (props.textColor !== undefined && props.textColor !== 'default') ||
        (props.backgroundColor !== undefined &&
          props.backgroundColor !== 'default') ||
        (block.type !== 'image' &&
          props.textAlignment !== undefined &&
          props.textAlignment !== 'left')
      ) {
        return throwUnsupportedRecordRichTextContent();
      }
      const children = Array.isArray(block.children)
        ? convertBlockNoteToTipTap(block.children, enableVariables)
        : [];
      if (children.length > 0 && !isBlockNoteListItemType(block.type)) {
        return throwUnsupportedRecordRichTextContent();
      }
      const content = convertInlineContent(block.content, enableVariables);
      if (isBlockNoteListItemType(block.type)) {
        const isTask = block.type === 'checkListItem';
        const start =
          block.type === 'numberedListItem' && typeof props.start === 'number'
            ? props.start
            : undefined;
        return [
          {
            type: BLOCKNOTE_LIST_ITEM_TYPE_TO_TIPTAP_LIST_TYPE[block.type],
            ...(isDefined(start) ? { attrs: { start } } : {}),
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
      switch (block.type) {
        case 'paragraph':
          return [{ type: 'paragraph', content }, ...children];
        case 'heading':
          if (
            (typeof props.level === 'number' && props.level > 3) ||
            props.isToggleable === true
          ) {
            return throwUnsupportedRecordRichTextContent();
          }
          return [
            { type: 'heading', attrs: { level: props.level ?? 1 }, content },
            ...children,
          ];
        case 'image':
          if (props.showPreview === false) {
            return throwUnsupportedRecordRichTextContent();
          }
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
          return throwUnsupportedRecordRichTextContent();
      }
    })
    .reduce<JSONContent[]>((nodes, node) => {
      const previousNode = nodes.at(-1);
      if (
        isDefined(previousNode) &&
        isTipTapListType(node.type) &&
        previousNode.type === node.type &&
        !isDefined(node.attrs?.start)
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

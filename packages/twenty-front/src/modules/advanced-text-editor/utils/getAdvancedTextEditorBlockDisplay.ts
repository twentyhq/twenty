import { ADVANCED_TEXT_EDITOR_BLOCK_CATALOG } from '@/advanced-text-editor/constants/AdvancedTextEditorBlockCatalog';
import { ADVANCED_TEXT_EDITOR_TEXT_INSERTION_ITEMS } from '@/advanced-text-editor/constants/AdvancedTextEditorTextInsertionItems';
import { isAdvancedTextEditorBlockNodeType } from '@/advanced-text-editor/types/AdvancedTextEditorBlockCatalog';
import { type Node as ProseMirrorNode } from '@tiptap/pm/model';
import { isDefined, TIPTAP_NODE_TYPES } from 'twenty-shared/utils';

export const getAdvancedTextEditorBlockDisplay = (
  doc: ProseMirrorNode,
  pos: number,
) => {
  const $pos = doc.resolve(pos);
  const node =
    $pos.nodeAfter?.type.name === TIPTAP_NODE_TYPES.LIST_ITEM
      ? $pos.parent
      : $pos.nodeAfter;
  const nodeTypeName = node?.type.name ?? TIPTAP_NODE_TYPES.PARAGRAPH;
  const textItem = ADVANCED_TEXT_EDITOR_TEXT_INSERTION_ITEMS.find((item) => {
    const content = item.createContent(() => '');

    return (
      content.type === nodeTypeName &&
      content.attrs?.level === node?.attrs.level
    );
  });

  if (isDefined(textItem)) {
    return textItem;
  }

  const { label, icon } =
    ADVANCED_TEXT_EDITOR_BLOCK_CATALOG[
      isAdvancedTextEditorBlockNodeType(nodeTypeName)
        ? nodeTypeName
        : TIPTAP_NODE_TYPES.PARAGRAPH
    ];

  return { title: label, icon };
};

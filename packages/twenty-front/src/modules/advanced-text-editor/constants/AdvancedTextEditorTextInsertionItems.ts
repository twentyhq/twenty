import { type AdvancedTextEditorBlockInsertionItem } from '@/advanced-text-editor/types/AdvancedTextEditorBlockCatalog';
import { msg } from '@lingui/core/macro';
import { TIPTAP_NODE_TYPES } from 'twenty-shared/utils';
import {
  IconH1,
  IconH2,
  IconH3,
  IconList,
  IconListNumbers,
  IconPilcrow,
} from 'twenty-ui/icon';

export const ADVANCED_TEXT_EDITOR_TEXT_INSERTION_ITEMS: Pick<
  AdvancedTextEditorBlockInsertionItem,
  'id' | 'title' | 'icon' | 'createContent'
>[] = [
  {
    id: 'paragraph',
    title: msg`Text`,
    icon: IconPilcrow,
    createContent: () => ({ type: TIPTAP_NODE_TYPES.PARAGRAPH }),
  },
  {
    id: 'h1',
    title: msg`Heading 1`,
    icon: IconH1,
    createContent: () => ({
      type: TIPTAP_NODE_TYPES.HEADING,
      attrs: { level: 1 },
    }),
  },
  {
    id: 'h2',
    title: msg`Heading 2`,
    icon: IconH2,
    createContent: () => ({
      type: TIPTAP_NODE_TYPES.HEADING,
      attrs: { level: 2 },
    }),
  },
  {
    id: 'h3',
    title: msg`Heading 3`,
    icon: IconH3,
    createContent: () => ({
      type: TIPTAP_NODE_TYPES.HEADING,
      attrs: { level: 3 },
    }),
  },
  {
    id: 'bulletList',
    title: msg`Bullet List`,
    icon: IconList,
    createContent: () => ({
      type: TIPTAP_NODE_TYPES.BULLET_LIST,
      content: [
        {
          type: TIPTAP_NODE_TYPES.LIST_ITEM,
          content: [{ type: TIPTAP_NODE_TYPES.PARAGRAPH }],
        },
      ],
    }),
  },
  {
    id: 'orderedList',
    title: msg`Ordered List`,
    icon: IconListNumbers,
    createContent: () => ({
      type: TIPTAP_NODE_TYPES.ORDERED_LIST,
      content: [
        {
          type: TIPTAP_NODE_TYPES.LIST_ITEM,
          content: [{ type: TIPTAP_NODE_TYPES.PARAGRAPH }],
        },
      ],
    }),
  },
];

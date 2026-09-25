import { ADVANCED_TEXT_EDITOR_BLOCK_CATALOG } from '@/advanced-text-editor/constants/AdvancedTextEditorBlockCatalog';
import { isAdvancedTextEditorBlockNodeType } from '@/advanced-text-editor/types/AdvancedTextEditorBlockCatalog';
import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { type Node as ProseMirrorNode } from '@tiptap/pm/model';
import { TIPTAP_NODE_TYPES } from 'twenty-shared/utils';
import {
  type IconComponent,
  IconH1,
  IconH2,
  IconH3,
  IconList,
  IconListNumbers,
  IconPilcrow,
} from 'twenty-ui/icon';

type AdvancedTextEditorNodeDisplay = {
  title: MessageDescriptor;
  icon: IconComponent;
};

const getHeadingDisplay = (level: unknown): AdvancedTextEditorNodeDisplay => {
  switch (level) {
    case 1:
      return { title: msg`Heading 1`, icon: IconH1 };
    case 2:
      return { title: msg`Heading 2`, icon: IconH2 };
    default:
      return { title: msg`Heading 3`, icon: IconH3 };
  }
};

export const getAdvancedTextEditorNodeDisplay = (
  node: ProseMirrorNode,
): AdvancedTextEditorNodeDisplay => {
  const nodeTypeName = node.type.name;

  if (isAdvancedTextEditorBlockNodeType(nodeTypeName)) {
    const { label, icon } = ADVANCED_TEXT_EDITOR_BLOCK_CATALOG[nodeTypeName];

    return { title: label, icon };
  }

  switch (nodeTypeName) {
    case TIPTAP_NODE_TYPES.HEADING:
      return getHeadingDisplay(node.attrs.level);
    case TIPTAP_NODE_TYPES.BULLET_LIST:
      return { title: msg`Bullet List`, icon: IconList };
    case TIPTAP_NODE_TYPES.ORDERED_LIST:
      return { title: msg`Ordered List`, icon: IconListNumbers };
    default:
      return { title: msg`Text`, icon: IconPilcrow };
  }
};

import { type Node as ProseMirrorNode } from '@tiptap/pm/model';

import { VALIDATION_RULE_FIELD_NODE_NAME } from '@/validation-rules/constants/ValidationRuleFieldNodeName';

export const getValidationRuleEditorNodeTextLength = (
  node: ProseMirrorNode,
): number => {
  if (node.isText) {
    return node.text?.length ?? 0;
  }

  return node.type.name === VALIDATION_RULE_FIELD_NODE_NAME
    ? String(node.attrs.path).length
    : 0;
};

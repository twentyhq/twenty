import { type Node as ProseMirrorNode } from '@tiptap/pm/model';

import { VALIDATION_RULE_FIELD_NODE_NAME } from '@/validation-rules/constants/ValidationRuleFieldNodeName';

export const getValidationRuleEditorText = (
  document: ProseMirrorNode,
  to: number = document.content.size,
): string =>
  document.textBetween(0, to, '', (leafNode) =>
    leafNode.type.name === VALIDATION_RULE_FIELD_NODE_NAME
      ? String(leafNode.attrs.path)
      : '',
  );

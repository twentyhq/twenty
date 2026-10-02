import { Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';

import { SettingsValidationRuleFieldNodeView } from '@/validation-rules/components/SettingsValidationRuleFieldNodeView';
import { VALIDATION_RULE_FIELD_NODE_NAME } from '@/validation-rules/constants/ValidationRuleFieldNodeName';

export const ValidationRuleFieldNode = Node.create({
  name: VALIDATION_RULE_FIELD_NODE_NAME,
  group: 'inline',
  inline: true,
  atom: true,

  addAttributes: () => ({
    path: { default: '' },
    label: { default: '' },
    iconName: { default: '' },
  }),

  renderHTML: ({ node }) => [
    'span',
    { 'data-type': VALIDATION_RULE_FIELD_NODE_NAME },
    String(node.attrs.path),
  ],

  renderText: ({ node }) => String(node.attrs.path),

  addNodeView() {
    return ReactNodeViewRenderer(SettingsValidationRuleFieldNodeView);
  },
});

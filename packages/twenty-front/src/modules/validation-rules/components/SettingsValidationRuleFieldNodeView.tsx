import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';

import { SettingsValidationRuleFieldChip } from '@/validation-rules/components/SettingsValidationRuleFieldChip';

type SettingsValidationRuleFieldNodeViewProps = NodeViewProps;

export const SettingsValidationRuleFieldNodeView = ({
  node,
}: SettingsValidationRuleFieldNodeViewProps) => (
  <NodeViewWrapper as="span">
    <SettingsValidationRuleFieldChip
      path={String(node.attrs.path)}
      label={String(node.attrs.label)}
      iconName={String(node.attrs.iconName)}
    />
  </NodeViewWrapper>
);

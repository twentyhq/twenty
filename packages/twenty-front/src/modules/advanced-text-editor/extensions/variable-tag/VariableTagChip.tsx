import { VariableChip } from '@/advanced-text-editor/extensions/variable-tag/VariableChip';
import { type NodeViewProps } from '@tiptap/react';
import { extractRawVariableNamePart } from 'twenty-shared/workflow';

type VariableTagChipProps = NodeViewProps;

export const VariableTagChip = ({
  deleteNode,
  editor,
  node,
}: VariableTagChipProps) => {
  const variable =
    typeof node.attrs.variable === 'string' ? node.attrs.variable : '';
  const label = extractRawVariableNamePart({
    rawVariableName: variable,
    part: 'selectedField',
  });

  return (
    <VariableChip
      deleteNode={deleteNode}
      editor={editor}
      label={label}
      title={variable}
    />
  );
};

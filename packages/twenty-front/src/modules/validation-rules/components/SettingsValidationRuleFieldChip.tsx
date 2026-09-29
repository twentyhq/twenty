import { styled } from '@linaria/react';
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import { useIcons } from 'twenty-ui/icon';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

import { BaseChip } from '@/ui/input/components/BaseChip';

const StyledWrapper = styled.span`
  display: inline-block;
  padding-inline: ${themeCssVariables.spacing[0.5]};
  vertical-align: middle;
  white-space: nowrap;
`;

type SettingsValidationRuleFieldChipProps = NodeViewProps;

export const SettingsValidationRuleFieldChip = ({
  node,
}: SettingsValidationRuleFieldChipProps) => {
  const theme = useTheme();
  const { getIcon } = useIcons();

  const Icon = getIcon(String(node.attrs.iconName));

  return (
    <NodeViewWrapper as={StyledWrapper}>
      <BaseChip
        label={String(node.attrs.label)}
        title={String(node.attrs.path)}
        leftIcon={<Icon size={theme.icon.size.sm} />}
      />
    </NodeViewWrapper>
  );
};

import { styled } from '@linaria/react';
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import { useIcons } from 'twenty-ui/icon';
import { Chip } from 'twenty-ui/primitives/data-display';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

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
      <Chip
        variant="soft"
        title={String(node.attrs.path)}
        startElement={<Icon size={theme.icon.size.sm} />}
      >
        {String(node.attrs.label)}
      </Chip>
    </NodeViewWrapper>
  );
};

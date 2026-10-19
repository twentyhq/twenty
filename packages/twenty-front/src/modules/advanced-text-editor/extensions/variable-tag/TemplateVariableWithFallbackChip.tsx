import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString, isString } from '@sniptt/guards';
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import { useId } from 'react';
import {
  formatTemplateVariableWithFallback,
  isDefined,
  parseTemplateVariableWithFallback,
} from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconAlertTriangle } from 'twenty-ui/icon';
import { Tooltip } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

import { TextInputDropdownForm } from '@/advanced-text-editor/components/TextInputDropdownForm';
import { VariableChip } from '@/advanced-text-editor/extensions/variable-tag/VariableChip';
import { BaseChip } from '@/ui/input/components/BaseChip';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';

const StyledWrapper = styled.span`
  display: inline-block;
  padding-inline: ${themeCssVariables.spacing[0.5]};
`;

const StyledMissingFallbackIcon = styled.span`
  display: flex;
`;

type TemplateVariableWithFallbackChipProps = NodeViewProps;

export const TemplateVariableWithFallbackChip = ({
  deleteNode,
  editor,
  node,
  updateAttributes,
}: TemplateVariableWithFallbackChipProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const dropdownId = `template-variable-fallback-dropdown-${useId()}`;
  const { closeDropdown } = useCloseDropdown();

  const rawTemplateVariable = isString(node.attrs.variable)
    ? node.attrs.variable
    : '';
  const templateVariableWithFallback =
    parseTemplateVariableWithFallback(rawTemplateVariable);

  if (!isDefined(templateVariableWithFallback) || !editor.isEditable) {
    return (
      <VariableChip
        deleteNode={deleteNode}
        editor={editor}
        label={rawTemplateVariable}
      />
    );
  }

  const handleFallbackSubmit = (fallback: string) => {
    const rawTemplateVariableWithSubmittedFallback =
      formatTemplateVariableWithFallback({
        name: templateVariableWithFallback.name,
        fallback: fallback.replace(/[{}]/g, ''),
      });

    closeDropdown(dropdownId);
    editor.commands.focus();

    if (rawTemplateVariableWithSubmittedFallback !== rawTemplateVariable) {
      updateAttributes({ variable: rawTemplateVariableWithSubmittedFallback });
    }
  };

  const missingFallbackIcon = isNonEmptyString(
    templateVariableWithFallback.fallback,
  ) ? undefined : (
    <Tooltip
      content={t`Add a fallback value to avoid empty personalization`}
      delay={TooltipDelay.shortDelay}
    >
      <StyledMissingFallbackIcon>
        <IconAlertTriangle
          size={theme.icon.size.sm}
          stroke={theme.icon.stroke.sm}
          color={theme.color.orange}
        />
      </StyledMissingFallbackIcon>
    </Tooltip>
  );

  return (
    <NodeViewWrapper as={StyledWrapper} style={{ whiteSpace: 'nowrap' }}>
      <DropdownRoot dropdownId={dropdownId} type="panel">
        <Dropdown.Trigger
          render={<span />}
          nativeButton={false}
          aria-label={t`Edit fallback value`}
        >
          <BaseChip
            label={`{{${templateVariableWithFallback.name}}}`}
            title={rawTemplateVariable}
            leftIcon={missingFallbackIcon}
            onRemove={(event) => {
              event.stopPropagation();
              deleteNode();
            }}
            removeAriaLabel={t`Remove variable`}
          />
        </Dropdown.Trigger>
        <DropdownContent
          align="start"
          finalFocus={(interaction) =>
            interaction === 'keyboard' ? editor.view.dom : false
          }
          aria-label={t`Fallback value`}
        >
          <Dropdown.Section>
            <TextInputDropdownForm
              defaultValue={templateVariableWithFallback.fallback ?? ''}
              label={t`Fallback value`}
              onSubmit={handleFallbackSubmit}
            />
          </Dropdown.Section>
        </DropdownContent>
      </DropdownRoot>
    </NodeViewWrapper>
  );
};

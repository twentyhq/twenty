/* @license Enterprise */

import { styled } from '@linaria/react';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconVariablePlus } from 'twenty-ui/icon';
import { useTheme, themeCssVariables } from 'twenty-ui/theme';

import { type VariablePickerComponent } from '@/ui/input/types/VariablePickerComponent';
import { SettingsRoleRuleConditionMeValueSelect } from '@/settings/roles/role-permissions/rule-conditions/components/SettingsRoleRuleConditionMeValueSelect';
import { RuleConditionVariablePickerContext } from '@/settings/roles/role-permissions/rule-conditions/contexts/RuleConditionVariablePickerContext';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useLingui } from '@lingui/react/macro';

const StyledRuleConditionPickerContainer = styled.div<{
  multiline?: boolean;
  readonly?: boolean;
}>`
  align-items: center;
  background-color: ${({ multiline }) =>
    multiline
      ? 'transparent'
      : themeCssVariables.background.transparent.lighter};
  border: ${({ multiline }) =>
    multiline ? 'none' : `1px solid ${themeCssVariables.border.color.medium}`};
  border-radius: ${({ multiline }) =>
    multiline
      ? `${themeCssVariables.border.radius.sm} 0 0 ${themeCssVariables.border.radius.sm}`
      : `0 ${themeCssVariables.border.radius.sm} ${themeCssVariables.border.radius.sm} 0`};
  color: ${({ multiline }) =>
    multiline
      ? themeCssVariables.font.color.primary
      : themeCssVariables.font.color.tertiary};
  cursor: ${({ multiline }) => (multiline ? 'default' : 'pointer')};
  display: flex;
  justify-content: center;
  padding: ${({ multiline }) =>
    multiline
      ? `${themeCssVariables.spacing['0.5']} ${themeCssVariables.spacing[0]}`
      : themeCssVariables.spacing[2]};
  position: ${({ multiline }) => (multiline ? 'absolute' : 'relative')};
  right: ${({ multiline }) =>
    multiline ? themeCssVariables.spacing[0] : 'auto'};
  top: ${({ multiline }) =>
    multiline ? themeCssVariables.spacing[0] : 'auto'};

  &:hover {
    background-color: ${({ readonly }) =>
      readonly
        ? 'transparent'
        : themeCssVariables.background.transparent.light};
  }
`;

export const SettingsRoleRuleConditionVariablePicker: VariablePickerComponent =
  ({ instanceId, disabled, multiline }) => {
    const { t } = useLingui();
    const theme = useTheme();
    const pickerContext = useContext(RuleConditionVariablePickerContext);

    if (!isDefined(pickerContext)) {
      return null;
    }

    const { recordFilterId, onSelect } = pickerContext;

    return (
      <DropdownRoot
        dropdownId={`rule-condition-me-picker-${instanceId}-${recordFilterId}`}
        type="picker"
      >
        <Dropdown.Trigger
          render={
            <StyledRuleConditionPickerContainer
              multiline={multiline}
              readonly={disabled}
            />
          }
          nativeButton={false}
          disabled={disabled}
          aria-label={t`Select a current user field`}
        >
          <IconVariablePlus size={theme.icon.size.sm} />
        </Dropdown.Trigger>
        <DropdownContent
          side="bottom"
          align="end"
          width={GenericDropdownContentWidth.Medium}
        >
          <SettingsRoleRuleConditionMeValueSelect
            onSelect={onSelect}
            recordFilterId={recordFilterId}
          />
        </DropdownContent>
      </DropdownRoot>
    );
  };

/* @license Enterprise */

import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconVariablePlus } from 'twenty-ui/icon';
import { useTheme } from 'twenty-ui/theme';

import { VariablePickerContainer } from '@/ui/input/components/VariablePickerContainer';
import { VariablePickerTrigger } from '@/ui/input/components/VariablePickerTrigger';
import { SettingsRoleRuleConditionMeValueSelect } from '@/settings/roles/role-permissions/rule-conditions/components/SettingsRoleRuleConditionMeValueSelect';
import { RuleConditionVariablePickerContext } from '@/settings/roles/role-permissions/rule-conditions/contexts/RuleConditionVariablePickerContext';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useLingui } from '@lingui/react/macro';

type SettingsRoleRuleConditionVariablePickerProps = {
  instanceId: string;
  disabled?: boolean;
  multiline?: boolean;
};

export const SettingsRoleRuleConditionVariablePicker = ({
  instanceId,
  disabled,
  multiline,
}: SettingsRoleRuleConditionVariablePickerProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const pickerContext = useContext(RuleConditionVariablePickerContext);

  if (!isDefined(pickerContext)) {
    return null;
  }

  const { recordFilterId, onSelect } = pickerContext;

  return (
    <VariablePickerContainer isReadonly={disabled} multiline={multiline}>
      <DropdownRoot
        dropdownId={`rule-condition-me-picker-${instanceId}-${recordFilterId}`}
        type="picker"
      >
        <Dropdown.Trigger
          render={<VariablePickerTrigger disabled={disabled} />}
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
    </VariablePickerContainer>
  );
};

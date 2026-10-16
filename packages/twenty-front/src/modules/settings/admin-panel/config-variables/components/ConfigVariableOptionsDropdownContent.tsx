import { isConfigVariablesInDbEnabledState } from '@/client-config/states/isConfigVariablesInDbEnabledState';
import { CONFIG_VARIABLE_SOURCE_OPTIONS } from '@/settings/admin-panel/config-variables/constants/ConfigVariableSourceOptions';
import { type ConfigVariableGroupFilter } from '@/settings/admin-panel/config-variables/types/ConfigVariableGroupFilter';
import { type ConfigVariableSourceFilter } from '@/settings/admin-panel/config-variables/types/ConfigVariableSourceFilter';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { Dropdown, useDropdownPage } from 'twenty-ui/components/navigation';
import { IconEye, IconEyeOff } from 'twenty-ui/icon';
import { Tag } from 'twenty-ui/primitives/data-display';

type ConfigVariableOptionsDropdownContentProps = {
  sourceFilter: ConfigVariableSourceFilter;
  groupFilter: ConfigVariableGroupFilter;
  groupOptions: { value: ConfigVariableGroupFilter; label: string }[];
  showHiddenGroupVariables: boolean;
  onSourceFilterChange: (source: ConfigVariableSourceFilter) => void;
  onGroupFilterChange: (group: ConfigVariableGroupFilter) => void;
  onShowHiddenChange: (value: boolean) => void;
};

export const ConfigVariableOptionsDropdownContent = ({
  sourceFilter,
  groupFilter,
  groupOptions,
  showHiddenGroupVariables,
  onSourceFilterChange,
  onGroupFilterChange,
  onShowHiddenChange,
}: ConfigVariableOptionsDropdownContentProps) => {
  const { goBack } = useDropdownPage();
  const { i18n } = useLingui();
  const isConfigVariablesInDbEnabled = useAtomStateValue(
    isConfigVariablesInDbEnabledState,
  );

  const availableSourceOptions = CONFIG_VARIABLE_SOURCE_OPTIONS.filter(
    (option) => isConfigVariablesInDbEnabled || option.value !== 'database',
  );

  return (
    <>
      <Dropdown.Page id="root">
        <Dropdown.Section>
          <Dropdown.ActionItem page="source" hasSubmenu={false}>
            <Tag color={'transparent'}>{t`Source`}</Tag>
          </Dropdown.ActionItem>
          <Dropdown.ActionItem page="group" hasSubmenu={false}>
            <Tag color={'transparent'}>{t`Group`}</Tag>
          </Dropdown.ActionItem>
        </Dropdown.Section>
        <Dropdown.Separator />
        <Dropdown.Section>
          <Dropdown.ActionItem
            closeOnClick={false}
            startIcon={showHiddenGroupVariables ? <IconEyeOff /> : <IconEye />}
            onClick={() => onShowHiddenChange(!showHiddenGroupVariables)}
          >
            {showHiddenGroupVariables
              ? t`Hide hidden groups`
              : t`Show hidden groups`}
          </Dropdown.ActionItem>
        </Dropdown.Section>
      </Dropdown.Page>
      <Dropdown.Page id="source">
        <Dropdown.Back>{t`Select Source`}</Dropdown.Back>
        <Dropdown.Section>
          {availableSourceOptions.map((option) => (
            <Dropdown.OptionItem
              key={option.value}
              selected={option.value === sourceFilter}
              closeOnSelect={false}
              onSelect={() => {
                onSourceFilterChange(option.value);
                goBack();
              }}
            >
              <Tag color={option.color}>{i18n._(option.label)}</Tag>
            </Dropdown.OptionItem>
          ))}
        </Dropdown.Section>
      </Dropdown.Page>
      <Dropdown.Page id="group">
        <Dropdown.Back>{t`Select Group`}</Dropdown.Back>
        <Dropdown.Section>
          {groupOptions.map((option) => (
            <Dropdown.OptionItem
              key={option.value}
              selected={option.value === groupFilter}
              closeOnSelect={false}
              onSelect={() => {
                onGroupFilterChange(option.value);
                goBack();
              }}
            >
              <Tag color={'transparent'}>{option.label}</Tag>
            </Dropdown.OptionItem>
          ))}
        </Dropdown.Section>
      </Dropdown.Page>
    </>
  );
};

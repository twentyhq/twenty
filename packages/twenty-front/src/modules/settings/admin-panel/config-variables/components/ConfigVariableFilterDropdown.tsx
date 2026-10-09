import { type ConfigVariableGroupFilter } from '@/settings/admin-panel/config-variables/types/ConfigVariableGroupFilter';
import { type ConfigVariableSourceFilter } from '@/settings/admin-panel/config-variables/types/ConfigVariableSourceFilter';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { t } from '@lingui/core/macro';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconSettings } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { ConfigVariableOptionsDropdownContent } from './ConfigVariableOptionsDropdownContent';

type ConfigVariableFilterDropdownProps = {
  sourceFilter: ConfigVariableSourceFilter;
  groupFilter: ConfigVariableGroupFilter;
  groupOptions: { value: string; label: string }[];
  showHiddenGroupVariables: boolean;
  onSourceFilterChange: (source: ConfigVariableSourceFilter) => void;
  onGroupFilterChange: (group: ConfigVariableGroupFilter) => void;
  onShowHiddenChange: (value: boolean) => void;
};

export const ConfigVariableFilterDropdown = ({
  sourceFilter,
  groupFilter,
  groupOptions,
  showHiddenGroupVariables,
  onSourceFilterChange,
  onGroupFilterChange,
  onShowHiddenChange,
}: ConfigVariableFilterDropdownProps) => {
  return (
    <DropdownRoot dropdownId="env-var-options-dropdown" type="picker">
      <Dropdown.Trigger
        render={
          <Button
            size="md"
            startIcon={<IconSettings />}
            variant="outline"
          >{t`Options`}</Button>
        }
      />
      <DropdownContent align="end" sideOffset={10}>
        <ConfigVariableOptionsDropdownContent
          sourceFilter={sourceFilter}
          groupFilter={groupFilter}
          groupOptions={groupOptions}
          showHiddenGroupVariables={showHiddenGroupVariables}
          onSourceFilterChange={onSourceFilterChange}
          onGroupFilterChange={onGroupFilterChange}
          onShowHiddenChange={onShowHiddenChange}
        />
      </DropdownContent>
    </DropdownRoot>
  );
};

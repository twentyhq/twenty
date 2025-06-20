import { ConfigVariableFilterCategory } from '@/settings/admin-panel/config-variables/types/ConfigVariableFilterCategory';
import { ConfigVariableGroupFilter } from '@/settings/admin-panel/config-variables/types/ConfigVariableGroupFilter';
import { ConfigVariableSourceFilter } from '@/settings/admin-panel/config-variables/types/ConfigVariableSourceFilter';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useState } from 'react';
import { IconSettings } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
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
  const [selectedCategory, setSelectedCategory] =
    useState<ConfigVariableFilterCategory | null>(null);

  const handleSelectCategory = (
    category: ConfigVariableFilterCategory | null,
  ) => {
    setSelectedCategory(category);
  };

  return (
    <Dropdown
      clickableComponent={
        <Button
          variant="secondary"
          size="medium"
          title="Options"
          Icon={IconSettings}
        />
      }
      dropdownId="env-var-options-dropdown"
      dropdownOffset={{ x: 0, y: 10 }}
      dropdownComponents={
        <ConfigVariableOptionsDropdownContent
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
          sourceFilter={sourceFilter}
          groupFilter={groupFilter}
          groupOptions={groupOptions}
          showHiddenGroupVariables={showHiddenGroupVariables}
          onSourceFilterChange={onSourceFilterChange}
          onGroupFilterChange={onGroupFilterChange}
          onShowHiddenChange={onShowHiddenChange}
        />
      }
    />
  );
};

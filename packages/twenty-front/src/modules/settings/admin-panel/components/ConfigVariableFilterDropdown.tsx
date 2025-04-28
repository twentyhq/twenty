import { ConfigVariableFilterCategory } from '@/settings/admin-panel/types/ConfigVariableFilterCategory';
import { ConfigVariableGroupFilter } from '@/settings/admin-panel/types/ConfigVariableGroupFilter';
import { ConfigVariableSourceFilter } from '@/settings/admin-panel/types/ConfigVariableSourceFilter';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useCallback, useState } from 'react';
import { IconSettings } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { ConfigVariableOptionsDropdownContent } from './ConfigVariableOptionsDropdownContent';

type ConfigVariableFilterDropdownProps = {
  sourceFilter: ConfigVariableSourceFilter;
  groupFilter: ConfigVariableGroupFilter;
  groupOptions: { value: string; label: string }[];
  showHidden: boolean;
  onSourceFilterChange: (source: ConfigVariableSourceFilter) => void;
  onGroupFilterChange: (group: ConfigVariableGroupFilter) => void;
  onShowHiddenChange: (value: boolean) => void;
};

export const ConfigVariableFilterDropdown = ({
  sourceFilter,
  groupFilter,
  groupOptions,
  showHidden,
  onSourceFilterChange,
  onGroupFilterChange,
  onShowHiddenChange,
}: ConfigVariableFilterDropdownProps) => {
  const [selectedCategory, setSelectedCategory] =
    useState<ConfigVariableFilterCategory | null>(null);

  const handleSelectCategory = useCallback(
    (category: ConfigVariableFilterCategory | null) => {
      setSelectedCategory(category);
    },
    [],
  );

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
      dropdownHotkeyScope={{ scope: 'env-var-options' }}
      dropdownOffset={{ x: 0, y: 10 }}
      dropdownComponents={
        <ConfigVariableOptionsDropdownContent
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
          sourceFilter={sourceFilter}
          groupFilter={groupFilter}
          groupOptions={groupOptions}
          showHidden={showHidden}
          onSourceFilterChange={onSourceFilterChange}
          onGroupFilterChange={onGroupFilterChange}
          onShowHiddenChange={onShowHiddenChange}
        />
      }
    />
  );
};

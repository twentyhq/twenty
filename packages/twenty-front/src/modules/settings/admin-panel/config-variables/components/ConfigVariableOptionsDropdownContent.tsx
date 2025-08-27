import { isConfigVariablesInDbEnabledState } from '@/client-config/states/isConfigVariablesInDbEnabledState';
import { CONFIG_VARIABLE_SOURCE_OPTIONS } from '@/settings/admin-panel/config-variables/constants/ConfigVariableSourceOptions';
import { type ConfigVariableFilterCategory } from '@/settings/admin-panel/config-variables/types/ConfigVariableFilterCategory';
import { type ConfigVariableGroupFilter } from '@/settings/admin-panel/config-variables/types/ConfigVariableGroupFilter';
import { type ConfigVariableSourceFilter } from '@/settings/admin-panel/config-variables/types/ConfigVariableSourceFilter';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useTheme } from '@emotion/react';
import { t } from '@lingui/core/macro';
import { useRecoilValue } from 'recoil';
import { IconChevronLeft, IconEye, IconEyeOff } from 'twenty-ui/display';
import { MenuItem, MenuItemSelectTag } from 'twenty-ui/navigation';

type ConfigVariableOptionsDropdownContentProps = {
  selectedCategory: ConfigVariableFilterCategory | null;
  onSelectCategory: (category: ConfigVariableFilterCategory | null) => void;
  sourceFilter: ConfigVariableSourceFilter;
  groupFilter: ConfigVariableGroupFilter;
  groupOptions: { value: ConfigVariableGroupFilter; label: string }[];
  showHiddenGroupVariables: boolean;
  onSourceFilterChange: (source: ConfigVariableSourceFilter) => void;
  onGroupFilterChange: (group: ConfigVariableGroupFilter) => void;
  onShowHiddenChange: (value: boolean) => void;
};

export const ConfigVariableOptionsDropdownContent = ({
  selectedCategory,
  onSelectCategory,
  sourceFilter,
  groupFilter,
  groupOptions,
  showHiddenGroupVariables,
  onSourceFilterChange,
  onGroupFilterChange,
  onShowHiddenChange,
}: ConfigVariableOptionsDropdownContentProps) => {
  const theme = useTheme();

  const isConfigVariablesInDbEnabled = useRecoilValue(
    isConfigVariablesInDbEnabledState,
  );

  const availableSourceOptions = CONFIG_VARIABLE_SOURCE_OPTIONS.filter(
    (option) => isConfigVariablesInDbEnabled || option.value !== 'database',
  );

  if (!selectedCategory) {
    return (
      <DropdownContent>
        <DropdownMenuItemsContainer>
          <MenuItemSelectTag
            text={t`Source`}
            color="transparent"
            onClick={() => onSelectCategory('source')}
          />
          <MenuItemSelectTag
            text={t`Group`}
            color="transparent"
            onClick={() => onSelectCategory('group')}
          />
        </DropdownMenuItemsContainer>
        <DropdownMenuSeparator />
        <DropdownMenuItemsContainer scrollable={false}>
          <MenuItem
            text={
              showHiddenGroupVariables
                ? t`Hide hidden groups`
                : t`Show hidden groups`
            }
            LeftIcon={() =>
              showHiddenGroupVariables ? (
                <IconEyeOff
                  size={theme.icon.size.md}
                  stroke={theme.icon.stroke.sm}
                />
              ) : (
                <IconEye
                  size={theme.icon.size.md}
                  stroke={theme.icon.stroke.sm}
                />
              )
            }
            onClick={() => onShowHiddenChange(!showHiddenGroupVariables)}
          />
        </DropdownMenuItemsContainer>
      </DropdownContent>
    );
  }

  return (
    <DropdownContent>
      <DropdownMenuHeader
        StartComponent={
          <DropdownMenuHeaderLeftComponent
            onClick={() => onSelectCategory(null)}
            Icon={IconChevronLeft}
          />
        }
      >
        {selectedCategory === 'source' && t`Select Source`}
        {selectedCategory === 'group' && t`Select Group`}
      </DropdownMenuHeader>
      <DropdownMenuItemsContainer>
        {selectedCategory === 'source' && (
          <>
            {availableSourceOptions.map((option) => (
              <MenuItemSelectTag
                key={option.value}
                text={option.label}
                color={option.color}
                selected={option.value === sourceFilter}
                onClick={() => {
                  onSourceFilterChange(option.value);
                  onSelectCategory(null);
                }}
              />
            ))}
          </>
        )}
        {selectedCategory === 'group' && (
          <>
            {groupOptions.map((option) => (
              <MenuItemSelectTag
                key={option.value}
                text={option.label}
                color="transparent"
                selected={option.value === groupFilter}
                onClick={() => {
                  onGroupFilterChange(option.value);
                  onSelectCategory(null);
                }}
              />
            ))}
          </>
        )}
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};

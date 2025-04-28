import { ConfigVariableSourceOptions } from '@/settings/admin-panel/constants/ConfigVariableSourceOptions';
import { ConfigVariableFilterCategory } from '@/settings/admin-panel/types/ConfigVariableFilterCategory';
import { ConfigVariableGroupFilter } from '@/settings/admin-panel/types/ConfigVariableGroupFilter';
import { ConfigVariableSourceFilter } from '@/settings/admin-panel/types/ConfigVariableSourceFilter';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useTheme } from '@emotion/react';
import { t } from '@lingui/core/macro';
import { IconChevronLeft, IconEye, IconEyeOff } from 'twenty-ui/display';
import { MenuItem, MenuItemSelectTag } from 'twenty-ui/navigation';

type ConfigVariableOptionsDropdownContentProps = {
  selectedCategory: ConfigVariableFilterCategory | null;
  onSelectCategory: (category: ConfigVariableFilterCategory | null) => void;
  sourceFilter: ConfigVariableSourceFilter;
  groupFilter: ConfigVariableGroupFilter;
  groupOptions: { value: string; label: string }[];
  showHidden: boolean;
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
  showHidden,
  onSourceFilterChange,
  onGroupFilterChange,
  onShowHiddenChange,
}: ConfigVariableOptionsDropdownContentProps) => {
  const theme = useTheme();

  if (!selectedCategory) {
    return (
      <>
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
              showHidden ? t`Hide hidden variables` : t`Show hidden variables`
            }
            LeftIcon={() =>
              showHidden ? (
                <IconEye
                  size={theme.icon.size.md}
                  stroke={theme.icon.stroke.sm}
                />
              ) : (
                <IconEyeOff
                  size={theme.icon.size.md}
                  stroke={theme.icon.stroke.sm}
                />
              )
            }
            onClick={() => onShowHiddenChange(!showHidden)}
          />
        </DropdownMenuItemsContainer>
      </>
    );
  }

  return (
    <>
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
            {ConfigVariableSourceOptions.map((option) => (
              <MenuItemSelectTag
                key={option.value}
                text={option.label}
                color={option.color}
                focused={option.value === sourceFilter}
                onClick={() => {
                  onSourceFilterChange(
                    option.value as ConfigVariableSourceFilter,
                  );
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
                focused={option.value === groupFilter}
                onClick={() => {
                  onGroupFilterChange(
                    option.value as ConfigVariableGroupFilter,
                  );
                  onSelectCategory(null);
                }}
              />
            ))}
          </>
        )}
      </DropdownMenuItemsContainer>
    </>
  );
};

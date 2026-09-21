import { DropdownListItem } from '@/ui/layout/dropdown/components/DropdownListItem';
import { Tag } from 'twenty-ui/primitives/data-display';
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
import { t } from '@lingui/core/macro';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { IconChevronLeft, IconEye, IconEyeOff } from 'twenty-ui/icon';
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
  const isConfigVariablesInDbEnabled = useAtomStateValue(
    isConfigVariablesInDbEnabledState,
  );

  const availableSourceOptions = CONFIG_VARIABLE_SOURCE_OPTIONS.filter(
    (option) => isConfigVariablesInDbEnabled || option.value !== 'database',
  );

  if (!selectedCategory) {
    return (
      <DropdownContent>
        <DropdownMenuItemsContainer>
          <DropdownListItem
            onClick={() => onSelectCategory('source')}
            role="option"
            aria-selected={false}
            selected={false}
            indicator="check"
          >
            <Tag
              color={'transparent'}
              borderStyle="dashed"
              variant={'soft'}
            >{t`Source`}</Tag>
          </DropdownListItem>
          <DropdownListItem
            onClick={() => onSelectCategory('group')}
            role="option"
            aria-selected={false}
            selected={false}
            indicator="check"
          >
            <Tag
              color={'transparent'}
              borderStyle="dashed"
              variant={'soft'}
            >{t`Group`}</Tag>
          </DropdownListItem>
        </DropdownMenuItemsContainer>
        <DropdownMenuSeparator />
        <DropdownMenuItemsContainer scrollable={false}>
          <DropdownListItem
            startIcon={showHiddenGroupVariables ? <IconEyeOff /> : <IconEye />}
            onClick={() => onShowHiddenChange(!showHiddenGroupVariables)}
          >
            {showHiddenGroupVariables
              ? t`Hide hidden groups`
              : t`Show hidden groups`}
          </DropdownListItem>
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
              <DropdownListItem
                key={option.value}
                onClick={() => {
                  onSourceFilterChange(option.value);
                  onSelectCategory(null);
                }}
                role="option"
                aria-selected={option.value === sourceFilter}
                selected={option.value === sourceFilter}
                indicator="check"
              >
                <Tag color={option.color} borderStyle="dashed" variant={'soft'}>
                  {option.label}
                </Tag>
              </DropdownListItem>
            ))}
          </>
        )}
        {selectedCategory === 'group' && (
          <>
            {groupOptions.map((option) => (
              <DropdownListItem
                key={option.value}
                onClick={() => {
                  onGroupFilterChange(option.value);
                  onSelectCategory(null);
                }}
                role="option"
                aria-selected={option.value === groupFilter}
                selected={option.value === groupFilter}
                indicator="check"
              >
                <Tag
                  color={'transparent'}
                  borderStyle="dashed"
                  variant={'soft'}
                >
                  {option.label}
                </Tag>
              </DropdownListItem>
            ))}
          </>
        )}
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};

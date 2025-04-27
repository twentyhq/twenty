import { ConfigVariableSourceOptions } from '@/settings/admin-panel/constants/ConfigVariableSourceOptions';
import { ConfigVariableFilterCategory } from '@/settings/admin-panel/types/ConfigVariableFilterCategory';
import { ConfigVariableGroupFilter } from '@/settings/admin-panel/types/ConfigVariableGroupFilter';
import { ConfigVariableSourceFilter } from '@/settings/admin-panel/types/ConfigVariableSourceFilter';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { IconArrowLeft, IconEyeOff } from 'twenty-ui/display';
import { Toggle } from 'twenty-ui/input';
import { MenuItemSelectTag } from 'twenty-ui/navigation';

const StyledHeaderContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledBackButton = styled.div`
  align-items: center;
  cursor: pointer;
  display: flex;
`;

const StyledToggleContainer = styled.div`
  align-items: center;
  border-top: 1px solid ${({ theme }) => theme.border.color.light};
  display: flex;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(2)};
`;

const StyledToggleLabel = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.sm};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
`;

interface OptionsDropdownContentProps {
  selectedCategory: ConfigVariableFilterCategory | null;
  onSelectCategory: (category: ConfigVariableFilterCategory | null) => void;
  sourceFilter: ConfigVariableSourceFilter;
  groupFilter: ConfigVariableGroupFilter;
  groupOptions: { value: string; label: string }[];
  showHidden: boolean;
  onSourceFilterChange: (source: ConfigVariableSourceFilter) => void;
  onGroupFilterChange: (group: ConfigVariableGroupFilter) => void;
  onShowHiddenChange: (value: boolean) => void;
}

export const OptionsDropdownContent = ({
  selectedCategory,
  onSelectCategory,
  sourceFilter,
  groupFilter,
  groupOptions,
  showHidden,
  onSourceFilterChange,
  onGroupFilterChange,
  onShowHiddenChange,
}: OptionsDropdownContentProps) => {
  const theme = useTheme();

  if (!selectedCategory) {
    return (
      <>
        <DropdownMenuItemsContainer>
          <MenuItemSelectTag
            text="Source"
            color="transparent"
            onClick={() => onSelectCategory('source')}
          />
          <MenuItemSelectTag
            text="Group"
            color="transparent"
            onClick={() => onSelectCategory('group')}
          />
        </DropdownMenuItemsContainer>
        <StyledToggleContainer>
          <StyledToggleLabel>
            <IconEyeOff size={theme.icon.size.md} />
            Show hidden variables
          </StyledToggleLabel>
          <Toggle value={showHidden} onChange={onShowHiddenChange} />
        </StyledToggleContainer>
      </>
    );
  }

  return (
    <>
      <StyledHeaderContainer>
        <StyledBackButton onClick={() => onSelectCategory(null)}>
          <IconArrowLeft size={theme.icon.size.md} />
        </StyledBackButton>
        {selectedCategory === 'source' && 'Select Source'}
        {selectedCategory === 'group' && 'Select Group'}
      </StyledHeaderContainer>
      <DropdownMenuSeparator />
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

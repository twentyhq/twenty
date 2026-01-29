import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import styled from '@emotion/styled';
import { type ReactNode } from 'react';
import { IconFilter, IconSearch } from 'twenty-ui/display';
import { IconButton } from 'twenty-ui/input';

type SettingsSearchInputProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  placeholder: string;
  instanceId: string;
  filterDropdownId?: string;
  filterDropdownContent?: ReactNode;
};

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  padding-bottom: ${({ theme }) => theme.spacing(2)};
`;

const StyledSearchInput = styled(SettingsTextInput)`
  flex: 1;
`;

export const SettingsSearchInput = ({
  searchValue,
  onSearchChange,
  placeholder,
  instanceId,
  filterDropdownId,
  filterDropdownContent,
}: SettingsSearchInputProps) => {
  return (
    <StyledContainer>
      <StyledSearchInput
        instanceId={instanceId}
        LeftIcon={IconSearch}
        placeholder={placeholder}
        value={searchValue}
        onChange={onSearchChange}
      />
      {filterDropdownId && (
        <Dropdown
          dropdownId={filterDropdownId}
          dropdownPlacement="bottom-end"
          dropdownOffset={{ x: 0, y: 8 }}
          clickableComponent={
            <IconButton Icon={IconFilter} variant="secondary" />
          }
          dropdownComponents={
            filterDropdownContent ? (
              <DropdownContent>
                <DropdownMenuItemsContainer>
                  {filterDropdownContent}
                </DropdownMenuItemsContainer>
              </DropdownContent>
            ) : null
          }
        />
      )}
    </StyledContainer>
  );
};

import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import styled from '@emotion/styled';
import { useState } from 'react';
import { IconFilter, useIcons } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import { MenuItem } from 'twenty-ui/navigation';

type SettingsServiceCenterFilterOptionsProps = {
  label: string;
  value: string;
  icon: string;
};

type SettingsServiceCenterFilterDropdownProps = {
  options: SettingsServiceCenterFilterOptionsProps[];
  scopeKey: string;
  handleCallbackFilter: (optionId: string) => void;
};

const StyledContainerSearchInput = styled.div`
  display: flex;
  flex-direction: row;
`;

export const StyledInput = styled.input`
  border: none;
  border-top: none;
  background-color: ${({ theme }) => theme.background.tertiary};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: 0;
  border-top-left-radius: ${({ theme }) => theme.border.radius.md};
  border-top-right-radius: ${({ theme }) => theme.border.radius.md};
  color: ${({ theme }) => theme.font.color.primary};
  margin: 0;
  outline: none;
  padding: ${({ theme }) => theme.spacing(2)};
  width: 100%;
  font-family: inherit;
  font-size: ${({ theme }) => theme.font.size.sm};

  font-weight: inherit;
  max-width: 100%;
  overflow: hidden;
  text-decoration: none;

  &::placeholder {
    color: ${({ theme }) => theme.font.color.light};
  }
`;

const StyledCustomDropdownMenu = styled(DropdownMenu)`
  background-color: ${({ theme }) => theme.background.tertiary};
`;

export const SettingsServiceCenterFilterDropdown = ({
  options,
  scopeKey,
  handleCallbackFilter,
}: SettingsServiceCenterFilterDropdownProps) => {
  const dropdownId = `${scopeKey}-filter-dropdown`;

  // const { t } = useTranslation();
  const { getIcon } = useIcons();
  const { closeDropdown } = useDropdown(dropdownId);
  const [searchText, setSearchText] = useState('');

  return (
    <Dropdown
      dropdownId={dropdownId}
      clickableComponent={
        <LightIconButton
          aria-label="Active Field Options"
          Icon={IconFilter}
          accent="secondary"
        />
      }
      dropdownComponents={
        <StyledCustomDropdownMenu width="100%">
          <StyledContainerSearchInput>
            <StyledInput
              value={searchText}
              autoFocus
              placeholder="Search"
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setSearchText(event.target.value)
              }
            />
          </StyledContainerSearchInput>

          <DropdownMenuItemsContainer>
            {options
              .filter((option) =>
                option.label.toLowerCase().includes(searchText),
              )
              .map((option) => (
                <MenuItem
                  key={option.value}
                  text={option.label}
                  LeftIcon={getIcon(option.icon)}
                  onClick={() => {
                    handleCallbackFilter(option.value);
                    setSearchText('');
                    closeDropdown();
                  }}
                />
              ))}
            <MenuItem
              text={'Reset sector filter'}
              LeftIcon={getIcon('IconFilterX')}
              onClick={() => {
                handleCallbackFilter('');
                setSearchText('');
                closeDropdown();
              }}
            />
          </DropdownMenuItemsContainer>
        </StyledCustomDropdownMenu>
      }
      dropdownHotkeyScope={{
        scope: dropdownId,
      }}
    />
  );
};

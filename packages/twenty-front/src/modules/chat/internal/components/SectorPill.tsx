/* eslint-disable @nx/workspace-explicit-boolean-predicates-in-if */
import { useFindAllSectors } from '@/settings/service-center/sectors/hooks/useFindAllSectors';
import { Sector } from '@/settings/service-center/sectors/types/Sector';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import styled from '@emotion/styled';
import { useEffect, useState } from 'react';
import { useIcons } from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';

type SectorPillDropdownProps = {
  label: string;
  value: string;
  icon: string;
};

type SectorPillProps = {
  options: SectorPillDropdownProps[];
  scopeKey: string;
  selectedValue: string | null;
};

const StyledSector = styled.div`
  align-items: center;
  background-color: ${({ theme }) => theme.background.tertiary};
  border-radius: 4px;
  color: ${({ theme }) => theme.font.color.primary};
  cursor: pointer;
  display: inline-flex;
  justify-content: center;
  max-height: 20px;
  padding: 4px 8px;
`;

const StyledCustomDropdownMenu = styled(DropdownMenu)`
  background-color: ${({ theme }) => theme.background.tertiary};
`;

export const SectorPill = ({
  options,
  scopeKey,
  selectedValue,
}: SectorPillProps) => {
  // const { t } = useTranslation();
  const dropdownId = `${scopeKey}-sector-dropdown`;
  const { closeDropdown } = useDropdown(dropdownId);

  // const { transferService } = useContext(
  //   CallCenterContext,
  // ) as CallCenterContextType;
  const { sectors } = useFindAllSectors();

  const [selectedOption, setSelectedOption] = useState<string>('Select');

  const { getIcon } = useIcons();

  useEffect(() => {
    if (selectedValue) {
      const selected = options.find((option) => option.value === selectedValue);
      if (selected) {
        setSelectedOption(selected.label);
      }
    }
  }, [selectedValue, options]);

  const handleSelect = (sectorId: string) => {
    const sector = sectors.find((s: Sector) => s.id === sectorId);
    // transferService(undefined, sector);
  };

  return (
    <Dropdown
      dropdownId={dropdownId}
      clickableComponent={
        <StyledSector>
          <p>{selectedOption}</p>
        </StyledSector>
      }
      dropdownComponents={
        <StyledCustomDropdownMenu width="160px">
          <DropdownMenuItemsContainer>
            {options.map((option) => (
              <MenuItem
                key={option.value}
                text={option.label}
                LeftIcon={getIcon(option.icon)}
                onClick={() => {
                  setSelectedOption(option.label);
                  handleSelect(option.value);
                  closeDropdown();
                }}
              />
            ))}
          </DropdownMenuItemsContainer>
        </StyledCustomDropdownMenu>
      }
      dropdownHotkeyScope={{
        scope: dropdownId,
      }}
    />
  );
};

import { useMemo, useState } from 'react';
import styled from '@emotion/styled';

import { LightIconButton } from '@/ui/button/components/LightIconButton';
import { DropdownMenuSearchInput } from '@/ui/dropdown/components/DropdownMenuSearchInput';
import { StyledDropdownMenu } from '@/ui/dropdown/components/StyledDropdownMenu';
import { StyledDropdownMenuItemsContainer } from '@/ui/dropdown/components/StyledDropdownMenuItemsContainer';
import { StyledDropdownMenuSeparator } from '@/ui/dropdown/components/StyledDropdownMenuSeparator';
import { IconComponent } from '@/ui/icon/types/IconComponent';

type IconPickerProps = {
  icons: Record<string, IconComponent>;
  onChange: (iconName: string) => void;
  selectedIconName?: string;
};

const StyledIconPickerDropdownMenu = styled(StyledDropdownMenu)`
  width: 176px;
`;

const StyledMenuIconItemsContainer = styled(StyledDropdownMenuItemsContainer)`
  flex-direction: row;
  flex-wrap: wrap;
  height: auto;
`;

const StyledLightIconButton = styled(LightIconButton)<{ isSelected?: boolean }>`
  background: ${({ theme, isSelected }) =>
    isSelected ? theme.background.transparent.light : 'transparent'};
`;

const convertIconNameToLabel = (iconName: string) =>
  iconName.replace(/[A-Z]/g, (letter) => ` ${letter}`).trim();

export const IconPicker = ({
  icons,
  onChange,
  selectedIconName,
}: IconPickerProps) => {
  const [searchString, setSearchString] = useState('');

  const iconNames = useMemo(() => {
    const filteredIconNames = Object.keys(icons).filter(
      (iconName) =>
        iconName !== selectedIconName &&
        (!searchString ||
          convertIconNameToLabel(iconName)
            .toLowerCase()
            .includes(searchString.toLowerCase())),
    );

    return (
      selectedIconName
        ? [selectedIconName, ...filteredIconNames]
        : filteredIconNames
    ).slice(0, 25);
  }, [icons, searchString, selectedIconName]);

  return (
    <StyledIconPickerDropdownMenu>
      <DropdownMenuSearchInput
        placeholder="Search icon"
        autoFocus
        onChange={(event) => setSearchString(event.target.value)}
      />
      <StyledDropdownMenuSeparator />
      <StyledMenuIconItemsContainer>
        {iconNames.map((iconName) => (
          <StyledLightIconButton
            aria-label={convertIconNameToLabel(iconName)}
            isSelected={selectedIconName === iconName}
            size="medium"
            Icon={icons[iconName]}
            onClick={() => onChange(iconName)}
          />
        ))}
      </StyledMenuIconItemsContainer>
    </StyledIconPickerDropdownMenu>
  );
};

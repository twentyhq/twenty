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
  selectedIconKey?: string;
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

const convertIconKeyToLabel = (iconName: string) =>
  iconName.replace(/[A-Z]/g, (letter) => ` ${letter}`).trim();

export const IconPicker = ({
  icons,
  onChange,
  selectedIconKey,
}: IconPickerProps) => {
  const [searchString, setSearchString] = useState('');

  const iconKeys = useMemo(() => {
    const filteredIconKeys = Object.keys(icons).filter(
      (iconKey) =>
        iconKey !== selectedIconKey &&
        (!searchString ||
          convertIconKeyToLabel(iconKey)
            .toLowerCase()
            .includes(searchString.toLowerCase())),
    );

    return (
      selectedIconKey
        ? [selectedIconKey, ...filteredIconKeys]
        : filteredIconKeys
    ).slice(0, 25);
  }, [icons, searchString, selectedIconKey]);

  return (
    <StyledIconPickerDropdownMenu>
      <DropdownMenuSearchInput
        placeholder="Search icon"
        autoFocus
        onChange={(event) => setSearchString(event.target.value)}
      />
      <StyledDropdownMenuSeparator />
      <StyledMenuIconItemsContainer>
        {iconKeys.map((iconKey) => (
          <StyledLightIconButton
            aria-label={convertIconKeyToLabel(iconKey)}
            isSelected={selectedIconKey === iconKey}
            size="medium"
            Icon={icons[iconKey]}
            onClick={() => onChange(iconKey)}
          />
        ))}
      </StyledMenuIconItemsContainer>
    </StyledIconPickerDropdownMenu>
  );
};

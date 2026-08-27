import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import {
  DEFAULT_COLOR_LABELS,
  MenuItemSelect,
  MenuItemSelectColor,
} from 'twenty-ui/navigation';
import { MAIN_COLOR_NAMES, type ThemeColor } from 'twenty-ui/theme';

import { DropdownMenuItemsContainer } from 'src/front-components/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from 'src/front-components/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from 'src/front-components/components/DropdownMenuSeparator';

type ThemeColorPickerMenuProps = {
  selectedColor: ThemeColor | undefined;
  isCustomSelected: boolean;
  onSelectColor: (color: ThemeColor) => void;
  onSelectCustom: () => void;
};

export const ThemeColorPickerMenu = ({
  selectedColor,
  isCustomSelected,
  onSelectColor,
  onSelectCustom,
}: ThemeColorPickerMenuProps) => {
  const [searchValue, setSearchValue] = useState('');

  const query = searchValue.trim().toLowerCase();

  const filteredColorNames = isNonEmptyString(query)
    ? MAIN_COLOR_NAMES.filter(
        (colorName) =>
          colorName.toLowerCase().includes(query) ||
          (DEFAULT_COLOR_LABELS[colorName] ?? '').toLowerCase().includes(query),
      )
    : MAIN_COLOR_NAMES;

  return (
    <>
      <DropdownMenuSearchInput
        placeholder="Search colors..."
        value={searchValue}
        onChange={setSearchValue}
      />
      <DropdownMenuSeparator />
      <DropdownMenuItemsContainer>
        {filteredColorNames.map((colorName) => (
          <MenuItemSelectColor
            key={colorName}
            onClick={() => onSelectColor(colorName)}
            color={colorName}
            selected={colorName === selectedColor}
            colorLabels={DEFAULT_COLOR_LABELS}
          />
        ))}
      </DropdownMenuItemsContainer>
      <DropdownMenuSeparator />
      <DropdownMenuItemsContainer>
        <MenuItemSelect
          text="Custom hex"
          selected={isCustomSelected}
          onClick={onSelectCustom}
        />
      </DropdownMenuItemsContainer>
    </>
  );
};

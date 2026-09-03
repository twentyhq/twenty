import styled from '@emotion/styled';
import {
  DEFAULT_COLOR_LABELS,
  MenuItemSelectColor,
} from 'twenty-ui/navigation';
import { MAIN_COLOR_NAMES, type ThemeColor } from 'twenty-ui/theme';

import { DropdownMenuItemsContainer } from 'src/front-components/components/DropdownMenuItemsContainer';
import { DropdownMenuOption } from 'src/front-components/components/DropdownMenuOption';
import { DropdownMenuSeparator } from 'src/front-components/components/DropdownMenuSeparator';

const StyledListbox = styled.div`
  min-height: 0;
  overflow-y: auto;
  width: 100%;
`;

const StyledColorOption = styled.div`
  width: 100%;
`;

type ThemeColorPickerMenuProps = {
  listboxId: string;
  selectedColor: ThemeColor | undefined;
  isCustomSelected: boolean;
  activeOption: ThemeColor | 'custom';
  getOptionId: (option: ThemeColor | 'custom') => string;
  onSelectColor: (color: ThemeColor) => void;
  onSelectCustom: () => void;
};

export const ThemeColorPickerMenu = ({
  listboxId,
  selectedColor,
  isCustomSelected,
  activeOption,
  getOptionId,
  onSelectColor,
  onSelectCustom,
}: ThemeColorPickerMenuProps) => (
  <StyledListbox id={listboxId} role="listbox" aria-label="Tile background">
    <DropdownMenuItemsContainer>
      {MAIN_COLOR_NAMES.map((colorName) => (
        <StyledColorOption
          key={colorName}
          id={getOptionId(colorName)}
          role="option"
          aria-selected={colorName === selectedColor}
          tabIndex={-1}
        >
          <MenuItemSelectColor
            color={colorName}
            colorLabels={DEFAULT_COLOR_LABELS}
            selected={colorName === selectedColor}
            focused={colorName === activeOption}
            onClick={() => onSelectColor(colorName)}
          />
        </StyledColorOption>
      ))}
    </DropdownMenuItemsContainer>
    <DropdownMenuSeparator />
    <DropdownMenuItemsContainer>
      <DropdownMenuOption
        id={getOptionId('custom')}
        text="Custom hex"
        selected={isCustomSelected}
        isActive={activeOption === 'custom'}
        onSelect={onSelectCustom}
      />
    </DropdownMenuItemsContainer>
  </StyledListbox>
);

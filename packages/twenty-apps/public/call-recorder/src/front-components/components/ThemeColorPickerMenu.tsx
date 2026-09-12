import styled from '@emotion/styled';
import { DEFAULT_COLOR_LABELS } from 'twenty-ui/navigation';
import { MAIN_COLOR_NAMES, type ThemeColor } from 'twenty-ui/theme';

import { DropdownMenuItemsContainer } from 'src/front-components/components/DropdownMenuItemsContainer';
import { DropdownMenuOption } from 'src/front-components/components/DropdownMenuOption';
import { DropdownMenuSeparator } from 'src/front-components/components/DropdownMenuSeparator';
import { SettingsColorSample } from 'src/front-components/components/SettingsColorSample';

const StyledListbox = styled.div`
  min-height: 0;
  overflow-y: auto;
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
        <DropdownMenuOption
          key={colorName}
          id={getOptionId(colorName)}
          onSelect={() => onSelectColor(colorName)}
          text={DEFAULT_COLOR_LABELS[colorName]}
          selected={colorName === selectedColor}
          isActive={colorName === activeOption}
          LeftComponent={<SettingsColorSample colorName={colorName} />}
        />
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

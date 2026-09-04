import { isUndefined } from '@sniptt/guards';
import { useState } from 'react';
import { DEFAULT_COLOR_LABELS } from 'twenty-ui/navigation';
import { MAIN_COLOR_NAMES, type ThemeColor } from 'twenty-ui/theme';

import { SettingsSelectControl } from 'src/front-components/components/SettingsSelectControl';
import { SettingsSelectMenu } from 'src/front-components/components/SettingsSelectMenu';
import { SettingsColorSample } from 'src/front-components/components/SettingsColorSample';
import { StyledSettingsSelectAnchor } from 'src/front-components/components/StyledSettingsSelectAnchor';
import { ThemeColorPickerMenu } from 'src/front-components/components/ThemeColorPickerMenu';
import {
  getNextActiveOptionIndex,
  type SettingsSelectNavigationKey,
} from 'src/front-components/utils/get-next-active-option-index.util';

// The control is capped at 120px, where "Custom hex" ellipsises to "Custom …".
const CUSTOM_CONTROL_LABEL = 'Custom';
const CUSTOM_OPTION_VALUE = 'custom';
const FALLBACK_SWATCH_COLOR_NAME: ThemeColor = 'gray';
const TILE_BACKGROUND_LISTBOX_ID = 'call-recorder-tile-background';

type TileBackgroundOption = ThemeColor | typeof CUSTOM_OPTION_VALUE;

// Built lazily: the SDK manifest extractor loads this module with twenty-ui
// mocked, so module-scope iteration over MAIN_COLOR_NAMES would throw.
const getTileBackgroundOptions = (): TileBackgroundOption[] => [
  ...MAIN_COLOR_NAMES,
  CUSTOM_OPTION_VALUE,
];

const getTileBackgroundOptionId = (option: TileBackgroundOption) =>
  `${TILE_BACKGROUND_LISTBOX_ID}-option-${option}`;

type TileBackgroundControlProps = {
  swatchColor: string;
  selectedColor: ThemeColor | undefined;
  isCustomSelected: boolean;
  disabled: boolean;
  onSelectColor: (color: ThemeColor) => void;
  onSelectCustom: () => void;
};

export const TileBackgroundControl = ({
  swatchColor,
  selectedColor,
  isCustomSelected,
  disabled,
  onSelectColor,
  onSelectCustom,
}: TileBackgroundControlProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeOptionIndex, setActiveOptionIndex] = useState(0);

  const tileBackgroundOptions = getTileBackgroundOptions();

  const label = isUndefined(selectedColor)
    ? CUSTOM_CONTROL_LABEL
    : (DEFAULT_COLOR_LABELS[selectedColor] ?? selectedColor);

  const selectedOption: TileBackgroundOption = isCustomSelected
    ? CUSTOM_OPTION_VALUE
    : (selectedColor ?? FALLBACK_SWATCH_COLOR_NAME);

  const handleMenuToggle = () => {
    if (!isMenuOpen) {
      setActiveOptionIndex(
        Math.max(tileBackgroundOptions.indexOf(selectedOption), 0),
      );
    }

    setIsMenuOpen((isOpen) => !isOpen);
  };
  const handleMenuClose = () => setIsMenuOpen(false);

  const handleNavigate = (key: SettingsSelectNavigationKey) => {
    setActiveOptionIndex((currentIndex) =>
      getNextActiveOptionIndex({
        key,
        currentIndex,
        optionCount: tileBackgroundOptions.length,
      }),
    );
  };

  const handleSelectActive = () => {
    const activeOption = tileBackgroundOptions[activeOptionIndex];

    if (activeOption === CUSTOM_OPTION_VALUE) {
      onSelectCustom();
    } else if (activeOption) {
      onSelectColor(activeOption);
    }

    handleMenuClose();
  };

  return (
    <StyledSettingsSelectAnchor>
      <SettingsSelectControl
        label={label}
        ariaLabel="Tile background"
        disabled={disabled}
        listboxId={TILE_BACKGROUND_LISTBOX_ID}
        activeDescendantId={getTileBackgroundOptionId(
          tileBackgroundOptions[activeOptionIndex] ?? CUSTOM_OPTION_VALUE,
        )}
        isExpanded={isMenuOpen}
        onNavigate={handleNavigate}
        onSelectActive={handleSelectActive}
        onEscape={handleMenuClose}
        adornment={
          <SettingsColorSample
            colorName={selectedColor ?? FALLBACK_SWATCH_COLOR_NAME}
            color={isCustomSelected ? swatchColor : undefined}
          />
        }
        onClick={handleMenuToggle}
      />
      <SettingsSelectMenu isOpen={isMenuOpen} onClose={handleMenuClose}>
        <ThemeColorPickerMenu
          listboxId={TILE_BACKGROUND_LISTBOX_ID}
          selectedColor={selectedColor}
          isCustomSelected={isCustomSelected}
          activeOption={
            tileBackgroundOptions[activeOptionIndex] ?? CUSTOM_OPTION_VALUE
          }
          getOptionId={getTileBackgroundOptionId}
          onSelectColor={(color) => {
            onSelectColor(color);
            handleMenuClose();
          }}
          onSelectCustom={() => {
            onSelectCustom();
            handleMenuClose();
          }}
        />
      </SettingsSelectMenu>
    </StyledSettingsSelectAnchor>
  );
};

import { isUndefined } from '@sniptt/guards';
import { useRef, useState } from 'react';
import { ColorSample } from 'twenty-ui/data-display';
import { DEFAULT_COLOR_LABELS } from 'twenty-ui/navigation';
import { type ThemeColor } from 'twenty-ui/theme';

import { FloatingMenu } from 'src/front-components/components/FloatingMenu';
import { SettingsSelectControl } from 'src/front-components/components/SettingsSelectControl';
import { ThemeColorPickerMenu } from 'src/front-components/components/ThemeColorPickerMenu';

// The control is capped at 120px, where "Custom hex" ellipsises to "Custom …".
const CUSTOM_CONTROL_LABEL = 'Custom';
const FALLBACK_SWATCH_COLOR_NAME: ThemeColor = 'gray';

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
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const label = isUndefined(selectedColor)
    ? CUSTOM_CONTROL_LABEL
    : (DEFAULT_COLOR_LABELS[selectedColor] ?? selectedColor);

  const handleMenuToggle = () => setIsMenuOpen((isOpen) => !isOpen);
  const handleMenuClose = () => setIsMenuOpen(false);

  return (
    <div ref={anchorRef}>
      <SettingsSelectControl
        label={label}
        disabled={disabled}
        adornment={
          <ColorSample
            colorName={selectedColor ?? FALLBACK_SWATCH_COLOR_NAME}
            color={swatchColor}
          />
        }
        onClick={handleMenuToggle}
      />
      {isMenuOpen && (
        <FloatingMenu anchorRef={anchorRef} onClose={handleMenuClose}>
          <ThemeColorPickerMenu
            selectedColor={selectedColor}
            isCustomSelected={isCustomSelected}
            onSelectColor={(color) => {
              onSelectColor(color);
              handleMenuClose();
            }}
            onSelectCustom={() => {
              onSelectCustom();
              handleMenuClose();
            }}
          />
        </FloatingMenu>
      )}
    </div>
  );
};

import { isUndefined } from '@sniptt/guards';
import { ColorSample } from 'twenty-ui/data-display';
import { DEFAULT_COLOR_LABELS } from 'twenty-ui/navigation';
import { type ThemeColor } from 'twenty-ui/theme';

import { FloatingMenu } from 'src/front-components/components/FloatingMenu';
import { SettingsSelectControl } from 'src/front-components/components/SettingsSelectControl';
import { ThemeColorPickerMenu } from 'src/front-components/components/ThemeColorPickerMenu';
import { FLOATING_MENU_DEFAULT_WIDTH_PIXELS } from 'src/front-components/constants/floating-menu.constant';
import { useAnchoredMenu } from 'src/front-components/hooks/use-anchored-menu';

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
  const { anchorRef, anchorRect, isOpen, close, toggle } = useAnchoredMenu();

  const label = isUndefined(selectedColor)
    ? CUSTOM_CONTROL_LABEL
    : (DEFAULT_COLOR_LABELS[selectedColor] ?? selectedColor);

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
        onClick={toggle}
      />
      {isOpen && !isUndefined(anchorRect) && (
        <FloatingMenu
          anchorRect={anchorRect}
          width={Math.max(anchorRect.width, FLOATING_MENU_DEFAULT_WIDTH_PIXELS)}
          onClose={close}
        >
          <ThemeColorPickerMenu
            selectedColor={selectedColor}
            isCustomSelected={isCustomSelected}
            onSelectColor={(color) => {
              onSelectColor(color);
              close();
            }}
            onSelectCustom={() => {
              onSelectCustom();
              close();
            }}
          />
        </FloatingMenu>
      )}
    </div>
  );
};

import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import {
  Dropdown,
  DEFAULT_COLOR_LABELS,
} from 'twenty-ui/components/navigation';
import { ColorSample } from 'twenty-ui/primitives/data-display';
import { type ThemeColor, MAIN_COLOR_NAMES } from 'twenty-ui/theme';

type ThemeColorPickerMenuProps = {
  selectedColor: ThemeColor;
  onSelectColor: (color: ThemeColor) => void;
};

export const ThemeColorPickerMenu = ({
  selectedColor,
  onSelectColor,
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
      <Dropdown.Search
        aria-label={t`Search colors`}
        placeholder={t`Search colors...`}
        value={searchValue}
        onValueChange={setSearchValue}
      />
      <Dropdown.Separator />
      <Dropdown.Section scrollable>
        {filteredColorNames.map((colorName) => (
          <Dropdown.OptionItem
            key={colorName}
            selected={colorName === selectedColor}
            onSelect={() => onSelectColor(colorName)}
            startIcon={<ColorSample colorName={colorName} />}
          >
            {DEFAULT_COLOR_LABELS[colorName]}
          </Dropdown.OptionItem>
        ))}
      </Dropdown.Section>
    </>
  );
};

import { useColorLabels } from '@/ui/input/hooks/useColorLabels';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';
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
  const colorLabels = useColorLabels();
  const [searchValue, setSearchValue] = useState('');
  const query = searchValue.trim().toLowerCase();
  const filteredColorNames = isNonEmptyString(query)
    ? MAIN_COLOR_NAMES.filter(
        (colorName) =>
          colorName.toLowerCase().includes(query) ||
          (colorLabels[colorName] ?? '').toLowerCase().includes(query),
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
      <Dropdown.SelectionGroup
        aria-label={t`Colors`}
        value={selectedColor}
        onValueChange={(selectedColorName) => {
          const colorName = MAIN_COLOR_NAMES.find(
            (colorName) => colorName === selectedColorName,
          );

          if (isDefined(colorName)) {
            onSelectColor(colorName);
          }
        }}
      >
        <Dropdown.Section scrollable>
          {filteredColorNames.map((colorName) => (
            <Dropdown.OptionItem
              key={colorName}
              value={colorName}
              startIcon={<ColorSample colorName={colorName} />}
            >
              {colorLabels[colorName]}
            </Dropdown.OptionItem>
          ))}
        </Dropdown.Section>
      </Dropdown.SelectionGroup>
    </>
  );
};

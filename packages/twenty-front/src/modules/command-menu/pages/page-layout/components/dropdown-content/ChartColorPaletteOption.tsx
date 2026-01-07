import { CHART_SETTINGS_PALETTE_COLOR_GROUP_COUNT } from '@/command-menu/pages/page-layout/constants/ChartSettingsPaletteColorGroupCount';
import { createGraphColorRegistry } from '@/page-layout/widgets/graph/utils/createGraphColorRegistry';
import { getColorSchemeByIndex } from '@/page-layout/widgets/graph/utils/getColorSchemeByIndex';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { ColorSample } from 'twenty-ui/display';
import { MenuItemSelect } from 'twenty-ui/navigation';
import { type ThemeColor } from 'twenty-ui/theme';
import { getMainColorNameFromPaletteColorName } from 'twenty-ui/utilities';

type ChartColorPaletteOptionProps = {
  selectedItemId: string | null;
  currentColor: string | null | undefined;
  onSelectColor: (colorName: ThemeColor | 'auto') => void;
};

const StyledColorSamplesContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(0.5)};
`;

export const ChartColorPaletteOption = ({
  selectedItemId,
  currentColor,
  onSelectColor,
}: ChartColorPaletteOptionProps) => {
  const theme = useTheme();

  const colorRegistry = createGraphColorRegistry(theme);

  const paletteColors = Array.from(
    { length: CHART_SETTINGS_PALETTE_COLOR_GROUP_COUNT },
    (_, index) => {
      const colorScheme = getColorSchemeByIndex(colorRegistry, index);

      return {
        colorName: colorScheme.name,
        color: colorScheme.solid,
      };
    },
  );

  const colorSamples = (
    <StyledColorSamplesContainer>
      {paletteColors.map((paletteColor) => (
        <ColorSample
          key={paletteColor.colorName}
          colorName={getMainColorNameFromPaletteColorName(
            paletteColor.colorName,
          )}
          color={paletteColor.color}
        />
      ))}
    </StyledColorSamplesContainer>
  );

  return (
    <SelectableListItem
      key={'auto'}
      itemId={'auto'}
      onEnter={() => {
        onSelectColor('auto');
      }}
    >
      <MenuItemSelect
        text={t`Default palette`}
        selected={false}
        focused={selectedItemId === 'auto' || currentColor === 'auto'}
        contextualText={colorSamples}
        contextualTextPosition="right"
        onClick={() => {
          onSelectColor('auto');
        }}
      />
    </SelectableListItem>
  );
};

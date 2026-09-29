import { CHART_SETTINGS_PALETTE_COLOR_GROUP_COUNT } from '@/side-panel/pages/page-layout/constants/ChartSettingsPaletteColorGroupCount';
import { createGraphColorRegistry } from '@/page-layout/widgets/graph/utils/createGraphColorRegistry';
import { getColorSchemeByIndex } from '@/page-layout/widgets/graph/utils/getColorSchemeByIndex';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { ColorSample } from 'twenty-ui/primitives/data-display';
import { ListItem } from 'twenty-ui/primitives/navigation';
import { getMainColorNameFromPaletteColorName } from 'twenty-ui/utilities';
import { useTheme, themeCssVariables, type ThemeColor } from 'twenty-ui/theme';

type ChartColorPaletteOptionProps = {
  selectedItemId: string | null;
  currentColor: string | null | undefined;
  onSelectColor: (colorName: ThemeColor | 'auto') => void;
};

const StyledColorSamplesContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[0.5]};
`;

export const ChartColorPaletteOption = ({
  selectedItemId,
  currentColor,
  onSelectColor,
}: ChartColorPaletteOptionProps) => {
  const theme = useTheme();
  const colorRegistry = createGraphColorRegistry(theme.color);

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
      <ListItem
        focused={selectedItemId === 'auto' || currentColor === 'auto'}
        onClick={() => {
          onSelectColor('auto');
        }}
        role="option"
        aria-selected={false}
        selected={false}
        indicator="check"
        description={colorSamples}
        descriptionPlacement={'end'}
      >{t`Default palette`}</ListItem>
    </SelectableListItem>
  );
};

import { CHART_SETTINGS_PALETTE_COLOR_GROUP_COUNT } from '@/side-panel/pages/page-layout/constants/ChartSettingsPaletteColorGroupCount';
import { createGraphColorRegistry } from '@/page-layout/widgets/graph/utils/createGraphColorRegistry';
import { getColorSchemeByIndex } from '@/page-layout/widgets/graph/utils/getColorSchemeByIndex';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { ColorSample } from 'twenty-ui/primitives/data-display';
import { Dropdown } from 'twenty-ui/components/navigation';
import { getMainColorNameFromPaletteColorName } from 'twenty-ui/utilities';
import { useTheme, themeCssVariables } from 'twenty-ui/theme';

const StyledColorSamplesContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[0.5]};
`;

export const ChartColorPaletteOption = () => {
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
    <Dropdown.OptionItem
      value="auto"
      description={colorSamples}
      descriptionPlacement="end"
    >{t`Default palette`}</Dropdown.OptionItem>
  );
};

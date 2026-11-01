import { CHART_SETTINGS_PALETTE_COLOR_GROUP_COUNT } from '@/side-panel/pages/page-layout/constants/ChartSettingsPaletteColorGroupCount';
import { createGraphColorRegistry } from '@/page-layout/widgets/graph/utils/createGraphColorRegistry';
import { generateGroupColor } from '@/page-layout/widgets/graph/utils/generateGroupColor';
import { styled } from '@linaria/react';
import { ColorSample } from 'twenty-ui/primitives/data-display';
import { Dropdown } from 'twenty-ui/components/navigation';
import { useTheme, themeCssVariables, type ThemeColor } from 'twenty-ui/theme';

type ChartColorGradientOptionProps = {
  colorOption: {
    id: string;
    name: string;
    colorName: ThemeColor;
  };
};

const StyledColorSamplesContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[0.5]};
`;

export const ChartColorGradientOption = ({
  colorOption,
}: ChartColorGradientOptionProps) => {
  const { colorName } = colorOption;

  const theme = useTheme();
  const colorRegistry = createGraphColorRegistry(theme.color);

  const colorSamples = (
    <StyledColorSamplesContainer>
      {Array.from({ length: CHART_SETTINGS_PALETTE_COLOR_GROUP_COUNT }).map(
        (_, index) => {
          const colorScheme = colorRegistry[colorName];
          const reversedIndex =
            CHART_SETTINGS_PALETTE_COLOR_GROUP_COUNT - 1 - index;
          const groupColor = generateGroupColor({
            colorScheme,
            groupIndex: reversedIndex,
            totalGroups: CHART_SETTINGS_PALETTE_COLOR_GROUP_COUNT,
          });
          return (
            <ColorSample key={index} colorName={colorName} color={groupColor} />
          );
        },
      )}
    </StyledColorSamplesContainer>
  );

  return (
    <Dropdown.OptionItem
      value={colorOption.id}
      description={colorSamples}
      descriptionPlacement="end"
    >
      {colorOption.name}
    </Dropdown.OptionItem>
  );
};

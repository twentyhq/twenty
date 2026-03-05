import { CHART_SETTINGS_PALETTE_COLOR_GROUP_COUNT } from '@/side-panel/pages/page-layout/constants/ChartSettingsPaletteColorGroupCount';
import { createGraphColorRegistry } from '@/page-layout/widgets/graph/utils/createGraphColorRegistry';
import { generateGroupColor } from '@/page-layout/widgets/graph/utils/generateGroupColor';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { styled } from '@linaria/react';
import { ColorSample } from 'twenty-ui/display';
import { MenuItemSelect } from 'twenty-ui/navigation';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { type ThemeColor } from 'twenty-ui/theme';
type ChartColorGradientOptionProps = {
  colorOption: {
    id: string;
    name: string;
    colorName: ThemeColor | 'auto';
  };
  selectedItemId: string | null;
  currentColor: string | null | undefined;
  onSelectColor: (colorName: ThemeColor | 'auto') => void;
};

const StyledColorSamplesContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[0.5]};
`;

export const ChartColorGradientOption = ({
  colorOption,
  selectedItemId,
  currentColor,
  onSelectColor,
}: ChartColorGradientOptionProps) => {
  const colorName = colorOption.colorName as ThemeColor;

  const colorRegistry = createGraphColorRegistry();

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
    <SelectableListItem
      key={colorOption.id}
      itemId={colorOption.id}
      onEnter={() => {
        onSelectColor(colorOption.colorName);
      }}
    >
      <MenuItemSelect
        text={colorOption.name}
        selected={false}
        focused={
          selectedItemId === colorOption.id || currentColor === colorOption.id
        }
        contextualText={colorSamples}
        contextualTextPosition="right"
        onClick={() => {
          onSelectColor(colorOption.colorName);
        }}
      />
    </SelectableListItem>
  );
};

import { createGraphColorRegistry } from '@/page-layout/widgets/graph/utils/createGraphColorRegistry';
import { generateGroupColor } from '@/page-layout/widgets/graph/utils/generateGroupColor';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { ColorSample } from 'twenty-ui/display';
import { MenuItemSelect } from 'twenty-ui/navigation';
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
  gap: ${({ theme }) => theme.spacing(0.5)};
`;

const COLOR_GROUP_COUNT = 5;

export const ChartColorGradientOption = ({
  colorOption,
  selectedItemId,
  currentColor,
  onSelectColor,
}: ChartColorGradientOptionProps) => {
  const colorName = colorOption.colorName as ThemeColor;
  const theme = useTheme();
  const colorRegistry = createGraphColorRegistry(theme);

  const colorSamples = (
    <StyledColorSamplesContainer>
      {Array.from({ length: COLOR_GROUP_COUNT }).map((_, index) => {
        const colorScheme = colorRegistry[colorName];
        const reversedIndex = COLOR_GROUP_COUNT - 1 - index;
        const groupColor = generateGroupColor({
          colorScheme,
          groupIndex: reversedIndex,
          totalGroups: COLOR_GROUP_COUNT,
        });
        return <ColorSample key={index} color={groupColor} />;
      })}
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

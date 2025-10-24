import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import styled from '@emotion/styled';
import { MenuItemSelect } from 'twenty-ui/navigation';
import { MAIN_COLORS, type ThemeColor } from 'twenty-ui/theme';

type ChartColorPaletteOptionProps = {
  selectedItemId: string | null;
  currentColor: string | null | undefined;
  onSelectColor: (colorName: ThemeColor | 'auto') => void;
};

const StyledColorSample = styled.div<{ color: string }>`
  background-color: ${({ color }) => color};
  border: 1px solid ${({ theme }) => theme.border.color.strong};
  border-radius: 60px;
  flex-shrink: 0;
  height: ${({ theme }) => theme.spacing(4)};
  width: ${({ theme }) => theme.spacing(3)};
`;

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
  const paletteColors: Array<keyof typeof MAIN_COLORS> = [
    'purple',
    'pink',
    'red',
    'orange',
    'yellow',
  ];

  const colorSamples = (
    <StyledColorSamplesContainer>
      {paletteColors.map((paletteColorName) => {
        const baseColor = MAIN_COLORS[paletteColorName];
        return <StyledColorSample key={paletteColorName} color={baseColor} />;
      })}
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
        text={'Palette'}
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

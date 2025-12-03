import { LINE_AREA_FILL_START_OPACITY } from '@/page-layout/widgets/graph/graphWidgetLineChart/constants/LineAreaFillStartOpacity';
import { type GraphColorScheme } from '@/page-layout/widgets/graph/types/GraphColorScheme';
import { createAreaFillDef } from '../createAreaFillDef';

const mockColorScheme: GraphColorScheme = {
  name: 'mock',
  solid: 'mockColor',
  variations: [
    'variant1',
    'variant2',
    'variant3',
    'variant4',
    'variant5',
    'variant6',
    'variant7',
    'variant8',
    'variant9',
    'variant10',
    'variant11',
    'variant12',
  ],
};

describe('createAreaFillDef', () => {
  it('uses a top-heavy gradient by default', () => {
    const def = createAreaFillDef(mockColorScheme, 'id-default');

    expect(def.colors).toEqual([
      {
        offset: 0,
        color: mockColorScheme.solid,
        opacity: LINE_AREA_FILL_START_OPACITY,
      },
      { offset: 100, color: mockColorScheme.solid, opacity: 0 },
    ]);
  });
});

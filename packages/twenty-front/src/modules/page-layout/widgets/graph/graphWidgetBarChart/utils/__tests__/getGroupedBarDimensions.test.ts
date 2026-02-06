import {
  computeGroupedBarLayout,
  getGroupedBarDimensions,
} from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/getGroupedBarDimensions';
import { type BarPositionContext } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/computeBarPositionContext';

const createContext = (
  overrides: Partial<BarPositionContext> = {},
): BarPositionContext => ({
  isVertical: true,
  dataLength: 1,
  keysLength: 2,
  categoryStep: 10,
  categoryWidth: 40,
  outerPadding: 0,
  valueAxisLength: 100,
  valueToPixel: (value: number) => value,
  zeroPixel: 0,
  ...overrides,
});

describe('getGroupedBarDimensions', () => {
  it('computes vertical bar dimensions', () => {
    const ctx = createContext({ isVertical: true });
    const layout = computeGroupedBarLayout(ctx, 2);

    const dimensions = getGroupedBarDimensions({
      ctx,
      layout,
      categoryStart: 10,
      keyIndex: 1,
      value: 20,
    });

    expect(dimensions).toEqual({
      x: 31,
      y: 80,
      width: 19,
      height: 20,
    });
  });

  it('computes horizontal bar dimensions', () => {
    const ctx = createContext({ isVertical: false, valueAxisLength: 100 });
    const layout = computeGroupedBarLayout(ctx, 2);

    const dimensions = getGroupedBarDimensions({
      ctx,
      layout,
      categoryStart: 10,
      keyIndex: 0,
      value: 30,
    });

    expect(dimensions).toEqual({
      x: 0,
      y: 10,
      width: 30,
      height: 19,
    });
  });
});

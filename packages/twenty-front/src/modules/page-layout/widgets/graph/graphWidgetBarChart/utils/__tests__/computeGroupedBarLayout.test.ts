import { BAR_CHART_CONSTANTS } from '@/page-layout/widgets/graph/graphWidgetBarChart/constants/BarChartConstants';
import { type BarPositionContext } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/computeBarPositionContext';
import { computeGroupedBarLayout } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/getGroupedBarDimensions';

const createContext = (
  overrides: Partial<BarPositionContext> = {},
): BarPositionContext => ({
  isVertical: true,
  dataLength: 1,
  keysLength: 2,
  categoryStep: 10,
  categoryWidth: 90,
  outerPadding: 0,
  valueAxisLength: 100,
  valueToPixel: (value: number) => value,
  zeroPixel: 0,
  ...overrides,
});

describe('computeGroupedBarLayout', () => {
  it('computes bar thickness and centering from spacing inputs', () => {
    const ctx = createContext({ keysLength: 3, categoryWidth: 90 });
    const innerPadding = 2;
    const layout = computeGroupedBarLayout(ctx, innerPadding);

    const totalInnerPadding = innerPadding * (ctx.keysLength - 1);
    const availableBarSpace = ctx.categoryWidth - totalInnerPadding;
    const expectedBarThickness = Math.min(
      Math.max(
        availableBarSpace / ctx.keysLength,
        BAR_CHART_CONSTANTS.MINIMUM_BAR_WIDTH,
      ),
      BAR_CHART_CONSTANTS.MAXIMUM_WIDTH,
    );
    const expectedTotalWidth =
      expectedBarThickness * ctx.keysLength + totalInnerPadding;
    const expectedCenteringOffset =
      (ctx.categoryWidth - expectedTotalWidth) / 2;

    expect(layout.barThickness).toBeCloseTo(expectedBarThickness, 5);
    expect(layout.groupCenteringOffset).toBeCloseTo(expectedCenteringOffset, 5);
    expect(layout.barStride).toBeCloseTo(
      expectedBarThickness + innerPadding,
      5,
    );
  });

  it('caps bar thickness at the maximum width', () => {
    const ctx = createContext({ keysLength: 1, categoryWidth: 500 });
    const layout = computeGroupedBarLayout(ctx, 0);

    expect(layout.barThickness).toBe(BAR_CHART_CONSTANTS.MAXIMUM_WIDTH);
  });
});

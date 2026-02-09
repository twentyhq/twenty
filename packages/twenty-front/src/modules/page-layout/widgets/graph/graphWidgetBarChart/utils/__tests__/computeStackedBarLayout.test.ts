import { BAR_CHART_CONSTANTS } from '@/page-layout/widgets/graph/graphWidgetBarChart/constants/BarChartConstants';
import { type BarPositionContext } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/computeBarPositionContext';
import { computeStackedBarLayout } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/getStackedBarDimensions';

const createContext = (
  overrides: Partial<BarPositionContext> = {},
): BarPositionContext => ({
  isVertical: true,
  dataLength: 1,
  keysLength: 2,
  categoryStep: 10,
  categoryWidth: 80,
  outerPadding: 0,
  valueAxisLength: 200,
  valueToPixel: (value: number) => value,
  zeroPixel: 0,
  ...overrides,
});

describe('computeStackedBarLayout', () => {
  it('computes thickness, centering, and stack scale', () => {
    const ctx = createContext();
    const layout = computeStackedBarLayout(ctx, { min: -50, max: 150 });

    expect(layout.barThickness).toBe(BAR_CHART_CONSTANTS.MAXIMUM_WIDTH);
    expect(layout.categoryBarCenteringOffset).toBe(24);
    expect(layout.stackRange).toBe(200);
    expect(layout.stackValueToPixel(0)).toBe(0);
    expect(layout.stackValueToPixel(200)).toBe(200);
  });
});

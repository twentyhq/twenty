import { TEXT_MARGIN_LIMITS } from '@/page-layout/widgets/graph/constants/TextMarginLimits';
import { type ChartMargins } from '@/page-layout/widgets/graph/types/ChartMargins';
import { computeChartMargins } from '@/page-layout/widgets/graph/utils/computeChartMargins';

describe('computeChartMargins', () => {
  const defaultTickConfig = {
    categoryTickValues: ['A', 'B', 'C'],
    numberOfValueTicks: 5,
    bottomAxisTickRotation: 0,
    maxBottomAxisTickLabelLength: 10,
  };

  const defaultValueTickResult = {
    tickValues: [0, 25, 50, 75, 100],
    domain: { min: 0, max: 100 },
  };

  const baseParams = {
    tickFontSize: 11,
    legendFontSize: 11,
    initialTickRotation: 0,
    computeTickConfig: () => defaultTickConfig,
    computeValueTickValues: () => defaultValueTickResult,
    getTickRotation: () => 0,
    resolveMarginInputs: () => ({
      bottomTickLabels: ['A', 'B', 'C'],
      leftTickLabels: ['0', '25', '50', '75', '100'],
    }),
  };

  it('computes margins with simple callbacks', () => {
    const result = computeChartMargins(baseParams);

    expect(result.margins).toBeDefined();
    expect(result.margins.top).toBeGreaterThanOrEqual(
      TEXT_MARGIN_LIMITS.min.top,
    );
    expect(result.margins.right).toBeGreaterThanOrEqual(
      TEXT_MARGIN_LIMITS.min.right,
    );
    expect(result.margins.bottom).toBeGreaterThanOrEqual(
      TEXT_MARGIN_LIMITS.min.bottom,
    );
    expect(result.margins.left).toBeGreaterThanOrEqual(
      TEXT_MARGIN_LIMITS.min.left,
    );
  });

  it('returns tick configuration', () => {
    const result = computeChartMargins(baseParams);

    expect(result.tickConfiguration).toEqual(defaultTickConfig);
  });

  it('returns value tick result', () => {
    const result = computeChartMargins(baseParams);

    expect(result.valueTickResult).toEqual(defaultValueTickResult);
  });

  it('margins stabilize and do not oscillate between iterations', () => {
    const callHistory: ChartMargins[] = [];

    const result = computeChartMargins({
      ...baseParams,
      computeTickConfig: (margins) => {
        callHistory.push({ ...margins });
        return defaultTickConfig;
      },
    });

    expect(result.margins).toBeDefined();
    expect(callHistory.length).toBeGreaterThan(0);
  });

  it('works with getBottomLegendOffset callback', () => {
    const result = computeChartMargins({
      ...baseParams,
      getBottomLegendOffset: () => 40,
    });

    expect(result.bottomLegendOffset).toBe(40);
    expect(result.margins).toBeDefined();
  });

  it('works without getBottomLegendOffset callback', () => {
    const result = computeChartMargins(baseParams);

    expect(result.bottomLegendOffset).toBeUndefined();
    expect(result.margins).toBeDefined();
  });

  it('handles empty tick label arrays', () => {
    const result = computeChartMargins({
      ...baseParams,
      resolveMarginInputs: () => ({
        bottomTickLabels: [],
        leftTickLabels: [],
      }),
    });

    expect(result.margins).toBeDefined();
    expect(result.margins.bottom).toBeGreaterThanOrEqual(
      TEXT_MARGIN_LIMITS.min.bottom,
    );
    expect(result.margins.left).toBeGreaterThanOrEqual(
      TEXT_MARGIN_LIMITS.min.left,
    );
  });

  it('respects margin limits', () => {
    const result = computeChartMargins(baseParams);

    expect(result.margins.top).toBeLessThanOrEqual(TEXT_MARGIN_LIMITS.max.top);
    expect(result.margins.right).toBeLessThanOrEqual(
      TEXT_MARGIN_LIMITS.max.right,
    );
    expect(result.margins.bottom).toBeLessThanOrEqual(
      TEXT_MARGIN_LIMITS.max.bottom,
    );
    expect(result.margins.left).toBeLessThanOrEqual(
      TEXT_MARGIN_LIMITS.max.left,
    );
  });
});

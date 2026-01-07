import { type BarDatum, type ComputedBarDatum } from '@nivo/bar';
import { computeBarChartStackedLabels } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/computeBarChartStackedLabels';

const createMockBar = (
  id: string,
  indexValue: string | number,
  value: number,
  x: number,
  y: number,
  width: number,
  height: number,
): ComputedBarDatum<BarDatum> =>
  ({
    id,
    key: id,
    index: 0,
    data: { id, indexValue, value },
    x,
    y,
    absX: x,
    absY: y,
    width,
    height,
    color: 'blue',
    label: String(indexValue),
    formattedValue: String(value),
  }) as unknown as ComputedBarDatum<BarDatum>;

describe('computeBarChartStackedLabels (essential cases)', () => {
  it('returns total for single index with all positive values', () => {
    const bars: ComputedBarDatum<BarDatum>[] = [
      createMockBar('series1', 'Jan', 100, 50, 200, 30, 100),
      createMockBar('series2', 'Jan', 50, 50, 100, 30, 100),
      createMockBar('series3', 'Jan', 25, 50, 50, 30, 50),
    ];

    const result = computeBarChartStackedLabels(bars);

    expect(result).toHaveLength(1);
    expect(result[0].key).toBe('total-Jan');
    expect(result[0].value).toBe(175);
    expect(result[0].verticalX).toBeCloseTo(65, 1);
    expect(result[0].verticalY).toBe(50);
    expect(result[0].horizontalX).toBe(80);
    expect(result[0].horizontalY).toBeCloseTo(158.33, 1);
    expect(result[0].shouldRenderBelow).toBe(false);
  });

  it('returns total for single index with all negative values', () => {
    const bars: ComputedBarDatum<BarDatum>[] = [
      createMockBar('series1', 'Jan', -100, 50, 400, 30, 100),
      createMockBar('series2', 'Jan', -50, 50, 500, 30, 100),
      createMockBar('series3', 'Jan', -25, 50, 575, 30, 50),
    ];

    const result = computeBarChartStackedLabels(bars);

    expect(result).toHaveLength(1);
    expect(result[0].key).toBe('total-Jan');
    expect(result[0].value).toBe(-175);
    expect(result[0].verticalX).toBeCloseTo(65, 1);
    expect(result[0].verticalY).toBe(625);
    expect(result[0].horizontalX).toBe(80);
    expect(result[0].horizontalY).toBeCloseTo(533.33, 1);
    expect(result[0].shouldRenderBelow).toBe(true);
  });

  it('returns total for single index with mixed positive/negative (net positive)', () => {
    const bars: ComputedBarDatum<BarDatum>[] = [
      createMockBar('series1', 'Jan', 100, 50, 200, 30, 100),
      createMockBar('series2', 'Jan', -30, 50, 370, 30, 70),
      createMockBar('series3', 'Jan', 20, 50, 250, 30, 50),
    ];

    const result = computeBarChartStackedLabels(bars);

    expect(result).toHaveLength(1);
    expect(result[0].key).toBe('total-Jan');
    expect(result[0].value).toBe(90);
    expect(result[0].verticalX).toBeCloseTo(65, 1);
    expect(result[0].verticalY).toBe(200);
    expect(result[0].horizontalX).toBe(80);
    expect(result[0].horizontalY).toBeCloseTo(310, 1);
    expect(result[0].shouldRenderBelow).toBe(false);
  });

  it('returns total for single index with mixed positive/negative (net negative)', () => {
    const bars: ComputedBarDatum<BarDatum>[] = [
      createMockBar('series1', 'Jan', -100, 50, 400, 30, 100),
      createMockBar('series2', 'Jan', 30, 50, 270, 30, 70),
      createMockBar('series3', 'Jan', 20, 50, 280, 30, 50),
    ];

    const result = computeBarChartStackedLabels(bars);

    expect(result).toHaveLength(1);
    expect(result[0].key).toBe('total-Jan');
    expect(result[0].value).toBe(-50);
    expect(result[0].verticalX).toBeCloseTo(65, 1);
    expect(result[0].verticalY).toBe(500);
    expect(result[0].horizontalX).toBe(80);
    expect(result[0].horizontalY).toBeCloseTo(353.33, 1);
    expect(result[0].shouldRenderBelow).toBe(true);
  });

  it('returns multiple totals for multiple indices', () => {
    const bars: ComputedBarDatum<BarDatum>[] = [
      createMockBar('series1', 'Jan', 100, 50, 200, 30, 100),
      createMockBar('series2', 'Jan', 50, 50, 100, 30, 100),
      createMockBar('series1', 'Feb', 75, 150, 225, 30, 75),
      createMockBar('series2', 'Feb', 25, 150, 275, 30, 50),
      createMockBar('series1', 'Mar', -50, 250, 400, 30, 50),
      createMockBar('series2', 'Mar', -30, 250, 430, 30, 30),
    ];

    const result = computeBarChartStackedLabels(bars);

    expect(result).toHaveLength(3);
    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: 'total-Jan',
          value: 150,
          shouldRenderBelow: false,
        }),
        expect.objectContaining({
          key: 'total-Feb',
          value: 100,
          shouldRenderBelow: false,
        }),
        expect.objectContaining({
          key: 'total-Mar',
          value: -80,
          shouldRenderBelow: true,
        }),
      ]),
    );
  });

  it('handles single bar per index (no stacking)', () => {
    const bars: ComputedBarDatum<BarDatum>[] = [
      createMockBar('series1', 'Jan', 100, 50, 200, 30, 100),
      createMockBar('series1', 'Feb', 150, 150, 150, 30, 150),
      createMockBar('series1', 'Mar', -50, 250, 400, 30, 50),
    ];

    const result = computeBarChartStackedLabels(bars);

    expect(result).toEqual([
      {
        key: 'total-Jan',
        value: 100,
        verticalX: 65,
        verticalY: 200,
        horizontalX: 80,
        horizontalY: 250,
        shouldRenderBelow: false,
      },
      {
        key: 'total-Feb',
        value: 150,
        verticalX: 165,
        verticalY: 150,
        horizontalX: 180,
        horizontalY: 225,
        shouldRenderBelow: false,
      },
      {
        key: 'total-Mar',
        value: -50,
        verticalX: 265,
        verticalY: 450,
        horizontalX: 280,
        horizontalY: 425,
        shouldRenderBelow: true,
      },
    ]);
  });

  it('handles zero values correctly', () => {
    const bars: ComputedBarDatum<BarDatum>[] = [
      createMockBar('series1', 'Jan', 100, 50, 200, 30, 100),
      createMockBar('series2', 'Jan', 0, 50, 300, 30, 0),
      createMockBar('series3', 'Jan', -100, 50, 400, 30, 100),
    ];

    const result = computeBarChartStackedLabels(bars);

    expect(result).toHaveLength(1);
    expect(result[0].key).toBe('total-Jan');
    expect(result[0].value).toBe(0);
    expect(result[0].verticalX).toBeCloseTo(65, 1);
    expect(result[0].verticalY).toBe(200);
    expect(result[0].horizontalX).toBe(80);
    expect(result[0].horizontalY).toBeCloseTo(333.33, 1);
    expect(result[0].shouldRenderBelow).toBe(false);
  });

  it('handles empty bars array', () => {
    const result = computeBarChartStackedLabels([]);
    expect(result).toEqual([]);
  });

  it('handles numeric index values (not just strings)', () => {
    const bars: ComputedBarDatum<BarDatum>[] = [
      createMockBar('series1', 2024, 100, 50, 200, 30, 100),
      createMockBar('series2', 2024, 50, 50, 100, 30, 100),
      createMockBar('series1', 2025, 75, 150, 225, 30, 75),
    ];

    const result = computeBarChartStackedLabels(bars);

    expect(result).toHaveLength(2);
    expect(result[0].key).toBe('total-2024');
    expect(result[0].value).toBe(150);
    expect(result[0].horizontalY).toBeCloseTo(200, 1);
    expect(result[1].key).toBe('total-2025');
    expect(result[1].value).toBe(75);
    expect(result[1].horizontalY).toBeCloseTo(262.5, 1);
  });

  it('tracks minimum Y position correctly for positive totals', () => {
    const bars: ComputedBarDatum<BarDatum>[] = [
      createMockBar('series1', 'Jan', 50, 100, 250, 30, 50),
      createMockBar('series2', 'Jan', 100, 100, 150, 30, 100),
      createMockBar('series3', 'Jan', 25, 100, 325, 30, 25),
    ];

    const result = computeBarChartStackedLabels(bars);

    expect(result[0].verticalY).toBe(150);
  });

  it('tracks maximum bottom Y position correctly for negative totals', () => {
    const bars: ComputedBarDatum<BarDatum>[] = [
      createMockBar('series1', 'Jan', -50, 100, 350, 30, 50),
      createMockBar('series2', 'Jan', -100, 100, 400, 30, 100),
      createMockBar('series3', 'Jan', -25, 100, 325, 30, 25),
    ];

    const result = computeBarChartStackedLabels(bars);

    expect(result[0].verticalY).toBe(500);
  });

  it('calculates center positions correctly', () => {
    const bars: ComputedBarDatum<BarDatum>[] = [
      createMockBar('series1', 'Jan', 100, 50, 200, 40, 100),
      createMockBar('series2', 'Jan', 50, 60, 150, 20, 50),
    ];

    const result = computeBarChartStackedLabels(bars);

    expect(result[0].verticalX).toBe((70 + 70) / 2); // (50+20, 60+10) avg
    expect(result[0].horizontalX).toBe(90); // max(50+40, 60+20) = 90
  });
});

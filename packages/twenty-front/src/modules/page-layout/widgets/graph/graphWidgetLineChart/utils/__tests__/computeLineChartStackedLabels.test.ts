import { type LineSeries, type Point } from '@nivo/line';
import { computeLineChartStackedLabels } from '@/page-layout/widgets/graph/graphWidgetLineChart/utils/computeLineChartStackedLabels';

const createMockPoint = (
  seriesId: string,
  dataX: string | number,
  dataY: number,
  pixelX: number,
  pixelY: number,
): Point<LineSeries> =>
  ({
    seriesId,
    data: { x: dataX, y: dataY },
    x: pixelX,
    y: pixelY,
  }) as Point<LineSeries>;

describe('computeLineChartStackedLabels (essential cases)', () => {
  it('returns total for single x-value with all positive values', () => {
    const points: Point<LineSeries>[] = [
      createMockPoint('series1', 'Jan', 100, 50, 200),
      createMockPoint('series2', 'Jan', 50, 50, 250),
      createMockPoint('series3', 'Jan', 25, 50, 275),
    ];

    const result = computeLineChartStackedLabels(points);

    expect(result).toEqual([
      {
        key: 'total-Jan',
        value: 175,
        x: 50,
        y: 200,
        shouldRenderBelow: false,
      },
    ]);
  });

  it('returns total for single x-value with all negative values', () => {
    const points: Point<LineSeries>[] = [
      createMockPoint('series1', 'Jan', -100, 50, 400),
      createMockPoint('series2', 'Jan', -50, 50, 350),
      createMockPoint('series3', 'Jan', -25, 50, 325),
    ];

    const result = computeLineChartStackedLabels(points);

    expect(result).toEqual([
      {
        key: 'total-Jan',
        value: -175,
        x: 50,
        y: 400,
        shouldRenderBelow: true,
      },
    ]);
  });

  it('returns total for single x-value with mixed positive/negative (net positive)', () => {
    const points: Point<LineSeries>[] = [
      createMockPoint('series1', 'Jan', 100, 50, 200),
      createMockPoint('series2', 'Jan', -30, 50, 270),
      createMockPoint('series3', 'Jan', 20, 50, 230),
    ];

    const result = computeLineChartStackedLabels(points);

    expect(result).toEqual([
      {
        key: 'total-Jan',
        value: 90,
        x: 50,
        y: 200,
        shouldRenderBelow: false,
      },
    ]);
  });

  it('returns total for single x-value with mixed positive/negative (net negative)', () => {
    const points: Point<LineSeries>[] = [
      createMockPoint('series1', 'Jan', -100, 50, 400),
      createMockPoint('series2', 'Jan', 30, 50, 270),
      createMockPoint('series3', 'Jan', 20, 50, 280),
    ];

    const result = computeLineChartStackedLabels(points);

    expect(result).toEqual([
      {
        key: 'total-Jan',
        value: -50,
        x: 50,
        y: 400,
        shouldRenderBelow: true,
      },
    ]);
  });

  it('returns multiple totals for multiple x-values', () => {
    const points: Point<LineSeries>[] = [
      createMockPoint('series1', 'Jan', 100, 50, 200),
      createMockPoint('series2', 'Jan', 50, 50, 250),
      createMockPoint('series1', 'Feb', 75, 150, 225),
      createMockPoint('series2', 'Feb', 25, 150, 275),
      createMockPoint('series1', 'Mar', -50, 250, 350),
      createMockPoint('series2', 'Mar', -30, 250, 330),
    ];

    const result = computeLineChartStackedLabels(points);

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

  it('handles single point per x-value (no stacking)', () => {
    const points: Point<LineSeries>[] = [
      createMockPoint('series1', 'Jan', 100, 50, 200),
      createMockPoint('series1', 'Feb', 150, 150, 150),
      createMockPoint('series1', 'Mar', -50, 250, 350),
    ];

    const result = computeLineChartStackedLabels(points);

    expect(result).toEqual([
      {
        key: 'total-Jan',
        value: 100,
        x: 50,
        y: 200,
        shouldRenderBelow: false,
      },
      {
        key: 'total-Feb',
        value: 150,
        x: 150,
        y: 150,
        shouldRenderBelow: false,
      },
      {
        key: 'total-Mar',
        value: -50,
        x: 250,
        y: 350,
        shouldRenderBelow: true,
      },
    ]);
  });

  it('handles zero values correctly', () => {
    const points: Point<LineSeries>[] = [
      createMockPoint('series1', 'Jan', 100, 50, 200),
      createMockPoint('series2', 'Jan', 0, 50, 300),
      createMockPoint('series3', 'Jan', -100, 50, 400),
    ];

    const result = computeLineChartStackedLabels(points);

    expect(result).toEqual([
      {
        key: 'total-Jan',
        value: 0,
        x: 50,
        y: 200, // Net zero uses minimumYPosition (0 < 0 is false, so not negative)
        shouldRenderBelow: false,
      },
    ]);
  });

  it('handles empty points array', () => {
    const result = computeLineChartStackedLabels([]);
    expect(result).toEqual([]);
  });

  it('handles numeric x-values (not just strings)', () => {
    const points: Point<LineSeries>[] = [
      createMockPoint('series1', 2024, 100, 50, 200),
      createMockPoint('series2', 2024, 50, 50, 250),
      createMockPoint('series1', 2025, 75, 150, 225),
    ];

    const result = computeLineChartStackedLabels(points);

    expect(result).toEqual([
      {
        key: 'total-2024',
        value: 150,
        x: 50,
        y: 200,
        shouldRenderBelow: false,
      },
      {
        key: 'total-2025',
        value: 75,
        x: 150,
        y: 225,
        shouldRenderBelow: false,
      },
    ]);
  });

  it('tracks minimum and maximum Y positions correctly across multiple series', () => {
    const points: Point<LineSeries>[] = [
      createMockPoint('series1', 'Jan', 50, 100, 250),
      createMockPoint('series2', 'Jan', 100, 100, 150),
      createMockPoint('series3', 'Jan', 25, 100, 325),
    ];

    const result = computeLineChartStackedLabels(points);

    expect(result).toEqual([
      {
        key: 'total-Jan',
        value: 175,
        x: 100,
        y: 150,
        shouldRenderBelow: false,
      },
    ]);
  });

  it('uses maximum Y position for negative totals', () => {
    const points: Point<LineSeries>[] = [
      createMockPoint('series1', 'Jan', -50, 100, 350),
      createMockPoint('series2', 'Jan', -100, 100, 400),
      createMockPoint('series3', 'Jan', -25, 100, 325),
    ];

    const result = computeLineChartStackedLabels(points);

    expect(result).toEqual([
      {
        key: 'total-Jan',
        value: -175,
        x: 100,
        y: 400,
        shouldRenderBelow: true,
      },
    ]);
  });
});

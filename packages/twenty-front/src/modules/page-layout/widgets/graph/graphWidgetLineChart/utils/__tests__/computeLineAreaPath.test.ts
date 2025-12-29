import { type ComputedSeries, type LineSeries } from '@nivo/line';

jest.mock('d3-shape', () => {
  const createAreaGenerator = () => {
    let y0Fn: (d: any, i: number) => number = () => 0;

    const generator = ((data: any[]) =>
      data
        .map((d, i) => `(${d.position.x},${y0Fn(d, i)},${d.position.y})`)
        .join('|')) as any;

    generator.defined = () => generator;
    generator.x = () => generator;
    generator.y1 = () => generator;
    generator.y0 = (fn: (d: any, i: number) => number) => {
      y0Fn = fn;
      return generator;
    };
    generator.curve = () => generator;

    return generator;
  };

  return {
    area: createAreaGenerator,
    curveMonotoneX: () => 'mockCurve',
  };
});

import { computeLineAreaPath } from '@/page-layout/widgets/graph/graphWidgetLineChart/utils/computeLineAreaPath';

const buildComputedSeries = (
  points: { x: number; y: number }[],
): ComputedSeries<LineSeries> =>
  ({
    id: 'series',
    data: points.map(({ x, y }) => ({
      data: { x, y },
      position: { x, y },
    })),
  }) as unknown as ComputedSeries<LineSeries>;

describe('computeLineAreaPath', () => {
  it('fills to the provided baseline for non-stacked mode', () => {
    const currentSeries = buildComputedSeries([
      { x: 0, y: 10 },
      { x: 10, y: 20 },
    ]);

    const path = computeLineAreaPath({
      currentSeries,
      baseline: 100,
    });

    expect(path).toBe('(0,100,10)|(10,100,20)');
  });

  it('fills between current and previous series for stacked mode', () => {
    const currentSeries = buildComputedSeries([
      { x: 0, y: 10 },
      { x: 10, y: 20 },
    ]);
    const previousStackedSeries = buildComputedSeries([
      { x: 0, y: 5 },
      { x: 10, y: 15 },
    ]);

    const path = computeLineAreaPath({
      currentSeries,
      previousStackedSeries,
      baseline: 100,
    });

    expect(path).toBe('(0,5,10)|(10,15,20)');
  });
});

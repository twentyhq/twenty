import { isPointInChartArea } from '@/page-layout/widgets/graph/chart-core/utils/isPointInChartArea';

describe('isPointInChartArea', () => {
  it('returns true for points inside or on the boundary', () => {
    expect(
      isPointInChartArea({
        x: 0,
        y: 0,
        innerWidth: 100,
        innerHeight: 50,
      }),
    ).toBe(true);

    expect(
      isPointInChartArea({
        x: 100,
        y: 50,
        innerWidth: 100,
        innerHeight: 50,
      }),
    ).toBe(true);
  });

  it('returns false for points outside the area', () => {
    expect(
      isPointInChartArea({
        x: -1,
        y: 0,
        innerWidth: 100,
        innerHeight: 50,
      }),
    ).toBe(false);

    expect(
      isPointInChartArea({
        x: 0,
        y: 51,
        innerWidth: 100,
        innerHeight: 50,
      }),
    ).toBe(false);
  });
});

import { getApplicationMonitoringChartIntegerTickValues } from '@/settings/application-monitoring/utils/getApplicationMonitoringChartIntegerTickValues';

describe('getApplicationMonitoringChartIntegerTickValues', () => {
  it('should keep one tick per count when the counts are small', () => {
    expect(getApplicationMonitoringChartIntegerTickValues(2)).toEqual([
      0, 1, 2,
    ]);
  });

  it('should space integer ticks to cover the maximum', () => {
    expect(getApplicationMonitoringChartIntegerTickValues(5)).toEqual([
      0, 2, 4, 6,
    ]);
    expect(getApplicationMonitoringChartIntegerTickValues(100)).toEqual([
      0, 25, 50, 75, 100,
    ]);
  });

  it('should still draw an axis without any value', () => {
    expect(getApplicationMonitoringChartIntegerTickValues(0)).toEqual([0, 1]);
  });
});

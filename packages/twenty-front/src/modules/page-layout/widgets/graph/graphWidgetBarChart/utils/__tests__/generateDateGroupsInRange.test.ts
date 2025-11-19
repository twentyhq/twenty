import { BAR_CHART_MAXIMUM_NUMBER_OF_BARS } from '@/page-layout/widgets/graph/graphWidgetBarChart/constants/BarChartMaximumNumberOfBars.constant';
import { ObjectRecordGroupByDateGranularity } from 'twenty-shared/types';
import { generateDateGroupsInRange } from '../generateDateGroupsInRange';

describe('generateDateGroupsInRange', () => {
  it('generates daily date groups', () => {
    const result = generateDateGroupsInRange({
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-07'),
      granularity: ObjectRecordGroupByDateGranularity.DAY,
    });

    expect(result).toHaveLength(7);
    expect(result[0]).toEqual(new Date('2024-01-01'));
    expect(result[6]).toEqual(new Date('2024-01-07'));
  });

  it('generates monthly date groups', () => {
    const result = generateDateGroupsInRange({
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-06-01'),
      granularity: ObjectRecordGroupByDateGranularity.MONTH,
    });

    expect(result).toHaveLength(6);
    expect(result[0]).toEqual(new Date('2024-01-01'));
    expect(result[5]).toEqual(new Date('2024-06-01'));
  });

  it('generates quarterly date groups', () => {
    const result = generateDateGroupsInRange({
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      granularity: ObjectRecordGroupByDateGranularity.QUARTER,
    });

    expect(result).toHaveLength(4);
    expect(result[0]).toEqual(new Date('2024-01-01'));
    expect(result[3]).toEqual(new Date('2024-10-01'));
  });

  it('generates yearly date groups', () => {
    const result = generateDateGroupsInRange({
      startDate: new Date('2020-01-01'),
      endDate: new Date('2024-12-31'),
      granularity: ObjectRecordGroupByDateGranularity.YEAR,
    });

    expect(result).toHaveLength(5);
    expect(result[0]).toEqual(new Date('2020-01-01'));
    expect(result[4]).toEqual(new Date('2024-01-01'));
  });

  it('respects the maximum number of bars limit', () => {
    const result = generateDateGroupsInRange({
      startDate: new Date('2024-01-01'),
      endDate: new Date('2025-12-31'),
      granularity: ObjectRecordGroupByDateGranularity.DAY,
    });

    expect(result.length).toBeLessThanOrEqual(BAR_CHART_MAXIMUM_NUMBER_OF_BARS);
  });
});

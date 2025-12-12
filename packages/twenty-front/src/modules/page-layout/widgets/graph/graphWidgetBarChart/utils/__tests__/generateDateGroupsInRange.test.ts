import { BAR_CHART_CONSTANTS } from '@/page-layout/widgets/graph/graphWidgetBarChart/constants/BarChartConstants';
import { ObjectRecordGroupByDateGranularity } from 'twenty-shared/types';
import { generateDateGroupsInRange } from '../generateDateGroupsInRange';

describe('generateDateGroupsInRange', () => {
  it('generates daily date groups', () => {
    const result = generateDateGroupsInRange({
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-07'),
      granularity: ObjectRecordGroupByDateGranularity.DAY,
    });

    expect(result.dates).toHaveLength(7);
    expect(result.dates[0]).toEqual(new Date('2024-01-01'));
    expect(result.dates[6]).toEqual(new Date('2024-01-07'));
    expect(result.wasTruncated).toBe(false);
  });

  it('generates monthly date groups', () => {
    const result = generateDateGroupsInRange({
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-06-01'),
      granularity: ObjectRecordGroupByDateGranularity.MONTH,
    });

    expect(result.dates).toHaveLength(6);
    expect(result.dates[0]).toEqual(new Date('2024-01-01'));
    expect(result.dates[5]).toEqual(new Date('2024-06-01'));
    expect(result.wasTruncated).toBe(false);
  });

  it('generates quarterly date groups', () => {
    const result = generateDateGroupsInRange({
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      granularity: ObjectRecordGroupByDateGranularity.QUARTER,
    });

    expect(result.dates).toHaveLength(4);
    expect(result.dates[0]).toEqual(new Date('2024-01-01'));
    expect(result.dates[3]).toEqual(new Date('2024-10-01'));
    expect(result.wasTruncated).toBe(false);
  });

  it('generates yearly date groups', () => {
    const result = generateDateGroupsInRange({
      startDate: new Date('2020-01-01'),
      endDate: new Date('2024-12-31'),
      granularity: ObjectRecordGroupByDateGranularity.YEAR,
    });

    expect(result.dates).toHaveLength(5);
    expect(result.dates[0]).toEqual(new Date('2020-01-01'));
    expect(result.dates[4]).toEqual(new Date('2024-01-01'));
    expect(result.wasTruncated).toBe(false);
  });

  it('truncates when exceeding maximum number of bars', () => {
    const result = generateDateGroupsInRange({
      startDate: new Date('2024-01-01'),
      endDate: new Date('2025-12-31'),
      granularity: ObjectRecordGroupByDateGranularity.DAY,
    });

    expect(result.dates.length).toBeLessThanOrEqual(
      BAR_CHART_CONSTANTS.MAXIMUM_NUMBER_OF_BARS,
    );
    expect(result.dates.length).toBe(
      BAR_CHART_CONSTANTS.MAXIMUM_NUMBER_OF_BARS,
    );
    expect(result.wasTruncated).toBe(true);
  });
});

import { BAR_CHART_CONSTANTS } from '@/page-layout/widgets/graph/graphWidgetBarChart/constants/BarChartConstants';
import { Temporal } from 'temporal-polyfill';
import { ObjectRecordGroupByDateGranularity } from 'twenty-shared/types';
import { generateDateGroupsInRange } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/generateDateGroupsInRange';

describe('generateDateGroupsInRange', () => {
  it('generates daily date groups', () => {
    const result = generateDateGroupsInRange({
      startDate: Temporal.PlainDate.from('2024-01-01'),
      endDate: Temporal.PlainDate.from('2024-01-07'),
      granularity: ObjectRecordGroupByDateGranularity.DAY,
    });

    expect(result.dates).toHaveLength(7);
    expect(result.dates[0].toString()).toEqual(
      Temporal.PlainDate.from('2024-01-01').toString(),
    );
    expect(result.dates[6].toString()).toEqual(
      Temporal.PlainDate.from('2024-01-07').toString(),
    );
    expect(result.wasTruncated).toBe(false);
  });

  it('generates monthly date groups', () => {
    const result = generateDateGroupsInRange({
      startDate: Temporal.PlainDate.from('2024-01-01'),
      endDate: Temporal.PlainDate.from('2024-06-01'),
      granularity: ObjectRecordGroupByDateGranularity.MONTH,
    });

    expect(result.dates).toHaveLength(6);
    expect(result.dates[0].toString()).toEqual(
      Temporal.PlainDate.from('2024-01-01').toString(),
    );
    expect(result.dates[5].toString()).toEqual(
      Temporal.PlainDate.from('2024-06-01').toString(),
    );
    expect(result.wasTruncated).toBe(false);
  });

  it('generates quarterly date groups', () => {
    const result = generateDateGroupsInRange({
      startDate: Temporal.PlainDate.from('2024-01-01'),
      endDate: Temporal.PlainDate.from('2024-12-31'),
      granularity: ObjectRecordGroupByDateGranularity.QUARTER,
    });

    expect(result.dates).toHaveLength(4);
    expect(result.dates[0].toString()).toEqual(
      Temporal.PlainDate.from('2024-01-01').toString(),
    );
    expect(result.dates[3].toString()).toEqual(
      Temporal.PlainDate.from('2024-10-01').toString(),
    );
    expect(result.wasTruncated).toBe(false);
  });

  it('generates yearly date groups', () => {
    const result = generateDateGroupsInRange({
      startDate: Temporal.PlainDate.from('2020-01-01'),
      endDate: Temporal.PlainDate.from('2024-12-31'),
      granularity: ObjectRecordGroupByDateGranularity.YEAR,
    });

    expect(result.dates).toHaveLength(5);
    expect(result.dates[0].toString()).toEqual(
      Temporal.PlainDate.from('2020-01-01').toString(),
    );
    expect(result.dates[4].toString()).toEqual(
      Temporal.PlainDate.from('2024-01-01').toString(),
    );
    expect(result.wasTruncated).toBe(false);
  });

  it('truncates when exceeding maximum number of bars', () => {
    const result = generateDateGroupsInRange({
      startDate: Temporal.PlainDate.from('2024-01-01'),
      endDate: Temporal.PlainDate.from('2025-12-31'),
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

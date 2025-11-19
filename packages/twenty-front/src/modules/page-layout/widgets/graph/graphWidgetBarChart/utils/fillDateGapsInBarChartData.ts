import { BAR_CHART_DATE_GRANULARITIES_WITHOUT_GAP_FILLING } from '@/page-layout/widgets/graph/graphWidgetBarChart/constants/BarChartDateGranularitiesWithoutGapFilling.constant';
import { generateDateRange } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/generateDateRange';
import { type GroupByRawResult } from '@/page-layout/widgets/graph/types/GroupByRawResult';
import { type ObjectRecordGroupByDateGranularity } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

type FillDateGapsParams = {
  data: GroupByRawResult[];
  keys: string[];
  dateGranularity: ObjectRecordGroupByDateGranularity;
  fillValue?: number;
  hasSecondDimension?: boolean;
};

const createMapKey = (date: Date, secondDimensionValue?: unknown): string => {
  return secondDimensionValue !== undefined
    ? `${date.toISOString()}_${String(secondDimensionValue)}`
    : date.toISOString();
};

const createFilledItem = (
  dimensionValues: unknown[],
  keys: string[],
  fillValue: number,
): GroupByRawResult => {
  const newItem: GroupByRawResult = {
    groupByDimensionValues: dimensionValues.map((value) =>
      value instanceof Date ? value.toISOString() : value,
    ),
  };

  for (const key of keys) {
    newItem[key] = fillValue;
  }

  return newItem;
};

export const fillDateGapsInBarChartData = ({
  data,
  keys,
  dateGranularity,
  fillValue = 0,
  hasSecondDimension = false,
}: FillDateGapsParams): GroupByRawResult[] => {
  if (data.length === 0) {
    return data;
  }

  if (BAR_CHART_DATE_GRANULARITIES_WITHOUT_GAP_FILLING.has(dateGranularity)) {
    return data;
  }

  const existingDataMap = new Map<string, GroupByRawResult>();
  const parsedDates: Date[] = [];
  const uniqueSecondDimensionValues = new Set<unknown>();

  for (const item of data) {
    const dateValue = item.groupByDimensionValues?.[0];

    if (!isDefined(dateValue)) {
      continue;
    }

    const parsedDate = new Date(String(dateValue));

    if (!isNaN(parsedDate.getTime())) {
      parsedDates.push(parsedDate);

      if (hasSecondDimension && isDefined(item.groupByDimensionValues?.[1])) {
        const secondDimensionValue = item.groupByDimensionValues[1];
        uniqueSecondDimensionValues.add(secondDimensionValue);

        const key = createMapKey(parsedDate, secondDimensionValue);
        existingDataMap.set(key, item);
      } else {
        existingDataMap.set(parsedDate.toISOString(), item);
      }
    }
  }

  if (parsedDates.length === 0) {
    return data;
  }

  const { minDate, maxDate } = parsedDates.reduce(
    (acc, date) => ({
      minDate: date < acc.minDate ? date : acc.minDate,
      maxDate: date > acc.maxDate ? date : acc.maxDate,
    }),
    { minDate: parsedDates[0], maxDate: parsedDates[0] },
  );

  const allDates = generateDateRange({
    startDate: minDate,
    endDate: maxDate,
    granularity: dateGranularity as
      | ObjectRecordGroupByDateGranularity.DAY
      | ObjectRecordGroupByDateGranularity.MONTH
      | ObjectRecordGroupByDateGranularity.QUARTER
      | ObjectRecordGroupByDateGranularity.YEAR,
  });

  const filledData: GroupByRawResult[] = [];

  for (const date of allDates) {
    const dimensionValues = hasSecondDimension
      ? Array.from(uniqueSecondDimensionValues)
      : [null];

    for (const secondDimensionValue of dimensionValues) {
      const key = createMapKey(
        date,
        hasSecondDimension ? secondDimensionValue : undefined,
      );
      const existingItem = existingDataMap.get(key);

      if (isDefined(existingItem)) {
        filledData.push(existingItem);
        continue;
      }

      const newDimensionValues = hasSecondDimension
        ? [date, secondDimensionValue]
        : [date];

      filledData.push(createFilledItem(newDimensionValues, keys, fillValue));
    }
  }

  return filledData;
};

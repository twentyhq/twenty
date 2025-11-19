import { BAR_CHART_DATE_GRANULARITIES_WITHOUT_GAP_FILLING } from '@/page-layout/widgets/graph/graphWidgetBarChart/constants/BarChartDateGranularitiesWithoutGapFilling.constant';
import { generateDateRange } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/generateDateRange';
import { type GroupByRawResult } from '@/page-layout/widgets/graph/types/GroupByRawResult';
import { type ObjectRecordGroupByDateGranularity } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

type FillDateGapsParams = {
  data: GroupByRawResult[];
  keys: string[];
  dateGranularity: ObjectRecordGroupByDateGranularity;
  hasSecondDimension?: boolean;
};

type OneDimensionalFillParams = {
  data: GroupByRawResult[];
  keys: string[];
  dateGranularity: ObjectRecordGroupByDateGranularity;
};

type TwoDimensionalFillParams = {
  data: GroupByRawResult[];
  keys: string[];
  dateGranularity: ObjectRecordGroupByDateGranularity;
};

const createFilledItem = (
  dimensionValues: unknown[],
  keys: string[],
): GroupByRawResult => {
  const newItem: GroupByRawResult = {
    groupByDimensionValues: dimensionValues.map((value) =>
      value instanceof Date ? value.toISOString() : value,
    ),
  };

  for (const key of keys) {
    newItem[key] = 0;
  }

  return newItem;
};

const getDateRangeFromData = (
  parsedDates: Date[],
  dateGranularity: ObjectRecordGroupByDateGranularity,
): Date[] => {
  const { minDate, maxDate } = parsedDates.reduce(
    (acc, date) => ({
      minDate: date < acc.minDate ? date : acc.minDate,
      maxDate: date > acc.maxDate ? date : acc.maxDate,
    }),
    { minDate: parsedDates[0], maxDate: parsedDates[0] },
  );

  return generateDateRange({
    startDate: minDate,
    endDate: maxDate,
    granularity: dateGranularity as
      | ObjectRecordGroupByDateGranularity.DAY
      | ObjectRecordGroupByDateGranularity.MONTH
      | ObjectRecordGroupByDateGranularity.QUARTER
      | ObjectRecordGroupByDateGranularity.YEAR,
  });
};

const fillDateGapsInOneDimensionalBarChartData = ({
  data,
  keys,
  dateGranularity,
}: OneDimensionalFillParams): GroupByRawResult[] => {
  const existingDataMap = new Map<string, GroupByRawResult>();
  const parsedDates: Date[] = [];

  for (const item of data) {
    const dateValue = item.groupByDimensionValues?.[0];

    if (!isDefined(dateValue)) {
      continue;
    }

    const parsedDate = new Date(String(dateValue));

    if (!isNaN(parsedDate.getTime())) {
      parsedDates.push(parsedDate);
      existingDataMap.set(parsedDate.toISOString(), item);
    }
  }

  if (parsedDates.length === 0) {
    return data;
  }

  const allDates = getDateRangeFromData(parsedDates, dateGranularity);

  return allDates.map((date) => {
    const key = date.toISOString();
    const existingItem = existingDataMap.get(key);

    return isDefined(existingItem)
      ? existingItem
      : createFilledItem([date], keys);
  });
};

const fillDateGapsInTwoDimensionalBarChartData = ({
  data,
  keys,
  dateGranularity,
}: TwoDimensionalFillParams): GroupByRawResult[] => {
  const existingDataMap = new Map<string, GroupByRawResult>();
  const parsedDates: Date[] = [];
  const uniqueSecondDimensionValues = new Set<unknown>();

  for (const item of data) {
    const dateValue = item.groupByDimensionValues?.[0];

    if (!isDefined(dateValue)) {
      continue;
    }

    const parsedDate = new Date(String(dateValue));

    if (isNaN(parsedDate.getTime())) {
      continue;
    }

    parsedDates.push(parsedDate);

    if (isDefined(item.groupByDimensionValues?.[1])) {
      const secondDimensionValue = item.groupByDimensionValues[1];
      uniqueSecondDimensionValues.add(secondDimensionValue);

      const key = `${parsedDate.toISOString()}_${String(secondDimensionValue)}`;
      existingDataMap.set(key, item);
    }
  }

  if (parsedDates.length === 0) {
    return data;
  }

  const allDates = getDateRangeFromData(parsedDates, dateGranularity);

  return allDates.flatMap((date) =>
    Array.from(uniqueSecondDimensionValues).map((secondDimensionValue) => {
      const key = `${date.toISOString()}_${String(secondDimensionValue)}`;
      const existingItem = existingDataMap.get(key);

      return isDefined(existingItem)
        ? existingItem
        : createFilledItem([date, secondDimensionValue], keys);
    }),
  );
};

export const fillDateGapsInBarChartData = ({
  data,
  keys,
  dateGranularity,
  hasSecondDimension = false,
}: FillDateGapsParams): GroupByRawResult[] => {
  if (data.length === 0) {
    return data;
  }

  if (BAR_CHART_DATE_GRANULARITIES_WITHOUT_GAP_FILLING.has(dateGranularity)) {
    return data;
  }

  if (hasSecondDimension) {
    return fillDateGapsInTwoDimensionalBarChartData({
      data,
      keys,
      dateGranularity,
    });
  }

  return fillDateGapsInOneDimensionalBarChartData({
    data,
    keys,
    dateGranularity,
  });
};

import { BAR_CHART_DATE_GRANULARITIES_WITHOUT_GAP_FILLING } from '@/page-layout/widgets/graph/graphWidgetBarChart/constants/BarChartDateGranularitiesWithoutGapFilling.constant';
import { generateDateGroupsInRange } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/generateDateGroupsInRange';
import { type GroupByRawResult } from '@/page-layout/widgets/graph/types/GroupByRawResult';
import { type ObjectRecordGroupByDateGranularity } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

type DimensionValue = string | Date | number | null;

type SupportedDateGranularity =
  | ObjectRecordGroupByDateGranularity.DAY
  | ObjectRecordGroupByDateGranularity.MONTH
  | ObjectRecordGroupByDateGranularity.QUARTER
  | ObjectRecordGroupByDateGranularity.YEAR;

type FillDateGapsParams = {
  data: GroupByRawResult[];
  keys: string[];
  dateGranularity: ObjectRecordGroupByDateGranularity;
  hasSecondDimension?: boolean;
};

type OneDimensionalFillParams = {
  data: GroupByRawResult[];
  keys: string[];
  dateGranularity: SupportedDateGranularity;
};

type TwoDimensionalFillParams = OneDimensionalFillParams;

const createEmptyDateGroup = (
  dimensionValues: DimensionValue[],
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

const getDateGroupsFromData = (
  parsedDates: Date[],
  dateGranularity: SupportedDateGranularity,
): Date[] => {
  const timestamps = parsedDates.map((date) => date.getTime());
  const minDate = new Date(Math.min(...timestamps));
  const maxDate = new Date(Math.max(...timestamps));

  return generateDateGroupsInRange({
    startDate: minDate,
    endDate: maxDate,
    granularity: dateGranularity,
  });
};

const fillDateGapsInOneDimensionalBarChartData = ({
  data,
  keys,
  dateGranularity,
}: OneDimensionalFillParams): GroupByRawResult[] => {
  const existingDateGroupsMap = new Map<string, GroupByRawResult>();
  const parsedDates: Date[] = [];

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
    existingDateGroupsMap.set(parsedDate.toISOString(), item);
  }

  if (parsedDates.length === 0) {
    return data;
  }

  const allDates = getDateGroupsFromData(parsedDates, dateGranularity);

  return allDates.map((date) => {
    const key = date.toISOString();
    const existingDateGroup = existingDateGroupsMap.get(key);

    return isDefined(existingDateGroup)
      ? existingDateGroup
      : createEmptyDateGroup([date], keys);
  });
};

const fillDateGapsInTwoDimensionalBarChartData = ({
  data,
  keys,
  dateGranularity,
}: TwoDimensionalFillParams): GroupByRawResult[] => {
  const existingDateGroupsMap = new Map<string, GroupByRawResult>();
  const parsedDates: Date[] = [];
  const uniqueSecondDimensionValues = new Set<DimensionValue>();

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
      const secondDimensionValue = item
        .groupByDimensionValues[1] as DimensionValue;
      uniqueSecondDimensionValues.add(secondDimensionValue);

      const key = `${parsedDate.toISOString()}_${String(secondDimensionValue)}`;
      existingDateGroupsMap.set(key, item);
    }
  }

  if (parsedDates.length === 0) {
    return data;
  }

  const allDates = getDateGroupsFromData(parsedDates, dateGranularity);

  return allDates.flatMap((date) =>
    Array.from(uniqueSecondDimensionValues).map((secondDimensionValue) => {
      const key = `${date.toISOString()}_${String(secondDimensionValue)}`;
      const existingDateGroup = existingDateGroupsMap.get(key);

      return isDefined(existingDateGroup)
        ? existingDateGroup
        : createEmptyDateGroup([date, secondDimensionValue], keys);
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
      dateGranularity: dateGranularity as SupportedDateGranularity,
    });
  }

  return fillDateGapsInOneDimensionalBarChartData({
    data,
    keys,
    dateGranularity: dateGranularity as SupportedDateGranularity,
  });
};

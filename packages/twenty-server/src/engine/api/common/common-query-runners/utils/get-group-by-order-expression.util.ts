import {
  FirstDayOfTheWeek,
  ObjectRecordGroupByDateGranularity,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type GroupByField } from 'src/engine/api/common/common-query-runners/types/group-by-field.types';
import { getGroupByExpression } from 'src/engine/api/common/common-query-runners/utils/get-group-by-expression.util';
import { isGroupByDateField } from 'src/engine/api/common/common-query-runners/utils/is-group-by-date-field.util';
import { isGroupByRelationField } from 'src/engine/api/common/common-query-runners/utils/is-group-by-relation-field.util';

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

const getDayOfWeekOrderExpression = (
  groupByExpression: string,
  weekStartDay?: FirstDayOfTheWeek,
): string => {
  const startDay = weekStartDay ?? FirstDayOfTheWeek.MONDAY;

  const startIndex =
    startDay === FirstDayOfTheWeek.SUNDAY
      ? 6
      : startDay === FirstDayOfTheWeek.SATURDAY
        ? 5
        : 0;

  const orderedDays = [
    ...DAYS_OF_WEEK.slice(startIndex),
    ...DAYS_OF_WEEK.slice(0, startIndex),
  ];

  const caseConditions = orderedDays
    .map((day, index) => `WHEN '${day}' THEN ${index + 1}`)
    .join(' ');

  return `CASE ${groupByExpression} ${caseConditions} END`;
};

export const getGroupByOrderExpression = ({
  groupByField,
  columnNameWithQuotes,
}: {
  groupByField: GroupByField;
  columnNameWithQuotes: string;
}): string => {
  if (
    !(isGroupByDateField(groupByField) || isGroupByRelationField(groupByField))
  ) {
    return getGroupByExpression({ groupByField, columnNameWithQuotes });
  }

  const dateGranularity = groupByField.dateGranularity;

  if (!isDefined(dateGranularity)) {
    return getGroupByExpression({ groupByField, columnNameWithQuotes });
  }

  const groupByExpression = getGroupByExpression({
    groupByField,
    columnNameWithQuotes,
  });

  switch (dateGranularity) {
    case ObjectRecordGroupByDateGranularity.DAY_OF_THE_WEEK:
      return getDayOfWeekOrderExpression(
        groupByExpression,
        groupByField.weekStartDay,
      );
    case ObjectRecordGroupByDateGranularity.MONTH_OF_THE_YEAR:
      return `CASE ${groupByExpression} WHEN 'January' THEN 1 WHEN 'February' THEN 2 WHEN 'March' THEN 3 WHEN 'April' THEN 4 WHEN 'May' THEN 5 WHEN 'June' THEN 6 WHEN 'July' THEN 7 WHEN 'August' THEN 8 WHEN 'September' THEN 9 WHEN 'October' THEN 10 WHEN 'November' THEN 11 WHEN 'December' THEN 12 END`;
    default:
      return groupByExpression;
  }
};

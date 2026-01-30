import { ObjectRecordGroupByDateGranularity } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type GroupByField } from 'src/engine/api/graphql/graphql-query-runner/group-by/resolvers/types/group-by-field.types';
import { getGroupByExpression } from 'src/engine/api/graphql/graphql-query-runner/group-by/resolvers/utils/get-group-by-expression.util';
import { isGroupByDateField } from 'src/engine/api/graphql/graphql-query-runner/group-by/resolvers/utils/is-group-by-date-field.util';
import { isGroupByRelationField } from 'src/engine/api/graphql/graphql-query-runner/group-by/resolvers/utils/is-group-by-relation-field.util';

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
      return `CASE ${groupByExpression} WHEN 'Monday' THEN 1 WHEN 'Tuesday' THEN 2 WHEN 'Wednesday' THEN 3 WHEN 'Thursday' THEN 4 WHEN 'Friday' THEN 5 WHEN 'Saturday' THEN 6 WHEN 'Sunday' THEN 7 END`;
    case ObjectRecordGroupByDateGranularity.MONTH_OF_THE_YEAR:
      return `CASE ${groupByExpression} WHEN 'January' THEN 1 WHEN 'February' THEN 2 WHEN 'March' THEN 3 WHEN 'April' THEN 4 WHEN 'May' THEN 5 WHEN 'June' THEN 6 WHEN 'July' THEN 7 WHEN 'August' THEN 8 WHEN 'September' THEN 9 WHEN 'October' THEN 10 WHEN 'November' THEN 11 WHEN 'December' THEN 12 END`;
    default:
      return groupByExpression;
  }
};

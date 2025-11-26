import { ObjectRecordGroupByDateGranularity } from 'twenty-shared/types';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';

import { type GroupByField } from 'src/engine/api/graphql/graphql-query-runner/group-by/resolvers/types/group-by-field.types';
import { isGroupByDateField } from 'src/engine/api/graphql/graphql-query-runner/group-by/resolvers/utils/is-group-by-date-field.util';
import { isGroupByRelationField } from 'src/engine/api/graphql/graphql-query-runner/group-by/resolvers/utils/is-group-by-relation-field.util';

export const getGroupByExpression = ({
  groupByField,
  columnNameWithQuotes,
}: {
  groupByField: GroupByField;
  columnNameWithQuotes: string;
}) => {
  if (
    !(isGroupByDateField(groupByField) || isGroupByRelationField(groupByField))
  ) {
    return columnNameWithQuotes;
  }

  const dateGranularity = groupByField.dateGranularity;

  if (!isDefined(dateGranularity)) {
    return columnNameWithQuotes;
  }

  switch (dateGranularity) {
    case ObjectRecordGroupByDateGranularity.NONE:
      return columnNameWithQuotes;
    case ObjectRecordGroupByDateGranularity.DAY_OF_THE_WEEK:
      return `TRIM(TO_CHAR(${columnNameWithQuotes}, 'TMDay'))`;
    case ObjectRecordGroupByDateGranularity.MONTH_OF_THE_YEAR:
      return `TRIM(TO_CHAR(${columnNameWithQuotes}, 'TMMonth'))`;
    case ObjectRecordGroupByDateGranularity.QUARTER_OF_THE_YEAR:
      return `TRIM(TO_CHAR(${columnNameWithQuotes}, '"Q"Q'))`;
    case ObjectRecordGroupByDateGranularity.WEEK: {
      const weekStartDay = groupByField.weekStartDay;
      let shiftedExpression = `DATE_TRUNC('week', ${columnNameWithQuotes})`;

      if (isDefined(weekStartDay)) {
        if (weekStartDay === 'SUNDAY') {
          shiftedExpression = `DATE_TRUNC('week', ${columnNameWithQuotes} + INTERVAL '1 day') - INTERVAL '1 day'`;
        } else if (weekStartDay === 'SATURDAY') {
          shiftedExpression = `DATE_TRUNC('week', ${columnNameWithQuotes} + INTERVAL '2 days') - INTERVAL '2 days'`;
        }
      }

      return `TO_CHAR(${shiftedExpression}, 'YYYY-MM-DD"T"HH24:MI:SSTZH:TZM')`;
    }
    case ObjectRecordGroupByDateGranularity.DAY:
    case ObjectRecordGroupByDateGranularity.MONTH:
    case ObjectRecordGroupByDateGranularity.QUARTER:
    case ObjectRecordGroupByDateGranularity.YEAR:
      return `TO_CHAR(DATE_TRUNC('${dateGranularity}', ${columnNameWithQuotes}), 'YYYY-MM-DD"T"HH24:MI:SSTZH:TZM')`;
    default:
      assertUnreachable(dateGranularity);
  }
};

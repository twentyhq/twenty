import { isDefined } from 'twenty-shared/utils';

import { ObjectRecordGroupByDateGranularity } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { type GroupByField } from 'src/engine/api/graphql/graphql-query-runner/group-by/resolvers/types/group-by-field.types';

export const getGroupByExpression = ({
  groupByField,
  columnNameWithQuotes,
}: {
  groupByField: GroupByField;
  columnNameWithQuotes: string;
}) => {
  if (isDefined(groupByField.dateGranularity)) {
    if (
      groupByField.dateGranularity === ObjectRecordGroupByDateGranularity.NONE
    ) {
      return columnNameWithQuotes;
    }

    if (
      groupByField.dateGranularity ===
      ObjectRecordGroupByDateGranularity.DAY_OF_THE_WEEK
    ) {
      return `TRIM(TO_CHAR(${columnNameWithQuotes}, 'TMDay'))`;
    }

    if (
      groupByField.dateGranularity ===
      ObjectRecordGroupByDateGranularity.MONTH_OF_THE_YEAR
    ) {
      return `TRIM(TO_CHAR(${columnNameWithQuotes}, 'TMMonth'))`;
    }

    if (
      groupByField.dateGranularity ===
      ObjectRecordGroupByDateGranularity.QUARTER_OF_THE_YEAR
    ) {
      return `TO_CHAR(${columnNameWithQuotes}, '"Q"Q')`;
    }

    return `DATE_TRUNC('${groupByField.dateGranularity}', ${columnNameWithQuotes})`;
  }

  return columnNameWithQuotes;
};

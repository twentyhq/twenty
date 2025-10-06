import { isDefined } from 'twenty-shared/utils';

import { ObjectRecordGroupByDateBucket } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { type GroupByField } from 'src/engine/api/graphql/graphql-query-runner/group-by/resolvers/types/group-by-field.types';

export const getGroupByExpression = ({
  groupByField,
  columnNameWithQuotes,
}: {
  groupByField: GroupByField;
  columnNameWithQuotes: string;
}) => {
  if (isDefined(groupByField.dateBucket)) {
    if (
      groupByField.dateBucket === ObjectRecordGroupByDateBucket.DAY_OF_THE_WEEK
    ) {
      return `TRIM(TO_CHAR(${columnNameWithQuotes}, 'TMDay'))`;
    }

    if (
      groupByField.dateBucket ===
      ObjectRecordGroupByDateBucket.MONTH_OF_THE_YEAR
    ) {
      return `TRIM(TO_CHAR(${columnNameWithQuotes}, 'TMMonth'))`;
    }

    if (
      groupByField.dateBucket ===
      ObjectRecordGroupByDateBucket.QUARTER_OF_THE_YEAR
    ) {
      return `TO_CHAR(${columnNameWithQuotes}, '"Q"Q')`;
    }

    return `DATE_TRUNC('${groupByField.dateBucket}', ${columnNameWithQuotes})`;
  }

  return columnNameWithQuotes;
};

import { t } from '@lingui/core/macro';
import { ObjectRecordGroupByDateGranularity } from 'twenty-shared/types';

import { type ObjectRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import { type IEdge } from 'src/engine/api/graphql/workspace-query-runner/interfaces/edge.interface';
import { type IGroupByConnection } from 'src/engine/api/graphql/workspace-query-runner/interfaces/group-by-connection.interface';

import { removeQuotes } from 'src/engine/api/graphql/graphql-query-runner/group-by/resolvers/utils/remove-quote.util';

export const formatResultWithGroupByDimensionValues = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  result: any[],
  groupByColumnsWithQuotes: {
    columnNameWithQuotes: string;
    alias: string;
    dateGranularity?: ObjectRecordGroupByDateGranularity;
  }[],
): IGroupByConnection<ObjectRecord, IEdge<ObjectRecord>>[] => {
  let formattedResult: IGroupByConnection<ObjectRecord, IEdge<ObjectRecord>>[] =
    [];

  result.forEach((group) => {
    let dimensionValues = [];

    for (const groupByColumn of groupByColumnsWithQuotes) {
      dimensionValues.push(group[groupByColumn.alias]);
    }
    const groupWithValueMappedToUnaliasedColumn = {
      ...group,
      ...groupByColumnsWithQuotes.reduce<Record<string, unknown>>(
        (acc, groupByColumn) => {
          const value = group[groupByColumn.alias];

          acc[removeQuotes(groupByColumn.columnNameWithQuotes)] =
            getTranslatedValueIfApplicable(
              value,
              groupByColumn.dateGranularity,
            );

          return acc;
        },
        {},
      ),
    };

    formattedResult.push({
      groupByDimensionValues: dimensionValues,
      ...groupWithValueMappedToUnaliasedColumn,
    });
  });

  return formattedResult;
};

const getTranslatedValueIfApplicable = (
  value: unknown,
  dateGranularity?: ObjectRecordGroupByDateGranularity,
) => {
  switch (dateGranularity) {
    case ObjectRecordGroupByDateGranularity.DAY_OF_THE_WEEK:
      switch (value) {
        case 'Monday':
          return t`Monday`;
        case 'Tuesday':
          return t`Tuesday`;
        case 'Wednesday':
          return t`Wednesday`;
        case 'Thursday':
          return t`Thursday`;
        case 'Friday':
          return t`Friday`;
        case 'Saturday':
          return t`Saturday`;
        case 'Sunday':
          return t`Sunday`;
        default:
          return value;
      }
    case ObjectRecordGroupByDateGranularity.MONTH_OF_THE_YEAR:
      switch (value) {
        case 'January':
          return t`January`;
        case 'February':
          return t`February`;
        case 'March':
          return t`March`;
        case 'April':
          return t`April`;
        case 'May':
          return t`May`;
        case 'June':
          return t`June`;
        case 'July':
          return t`July`;
        case 'August':
          return t`August`;
        case 'September':
          return t`September`;
        case 'October':
          return t`October`;
        case 'November':
          return t`November`;
        case 'December':
          return t`December`;
        default:
          return value;
      }
    default:
      return value;
  }
};

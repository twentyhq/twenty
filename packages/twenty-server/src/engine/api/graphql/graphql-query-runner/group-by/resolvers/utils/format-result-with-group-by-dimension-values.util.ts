import { t } from '@lingui/core/macro';
import {
  ObjectRecordGroupByDateGranularity,
  type ObjectRecord,
} from 'twenty-shared/types';

import { type IEdge } from 'src/engine/api/graphql/workspace-query-runner/interfaces/edge.interface';
import { type IGroupByConnection } from 'src/engine/api/graphql/workspace-query-runner/interfaces/group-by-connection.interface';

import { type CommonGroupByOutputItem } from 'src/engine/api/common/types/common-group-by-output-item.type';

export const formatResultWithGroupByDimensionValues = <
  T extends
    | IGroupByConnection<ObjectRecord, IEdge<ObjectRecord>>
    | CommonGroupByOutputItem,
>(
  result: Record<string, string>[],
  groupByColumnsWithQuotes: {
    columnNameWithQuotes: string;
    alias: string;
    dateGranularity?: ObjectRecordGroupByDateGranularity;
  }[],
  aggregateFieldNames: string[],
): T[] => {
  let formattedResult: T[] = [];

  result.forEach((group) => {
    let dimensionValues: string[] = [];

    for (const groupByColumn of groupByColumnsWithQuotes) {
      dimensionValues.push(
        getTranslatedValueIfApplicable(
          group[groupByColumn.alias],
          groupByColumn.dateGranularity,
        ),
      );
    }

    const aggregateValues = aggregateFieldNames.reduce(
      (acc, fieldName) => {
        if (fieldName in group) {
          acc[fieldName] = group[fieldName];
        }

        return acc;
      },
      {} as Record<string, string>,
    );

    formattedResult.push({
      groupByDimensionValues: dimensionValues,
      ...aggregateValues,
      //TODO: Refacto-common - remove generic type
    } as T);
  });

  return formattedResult;
};

const getTranslatedValueIfApplicable = (
  value: string,
  dateGranularity?: ObjectRecordGroupByDateGranularity,
): string => {
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

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
          acc[removeQuotes(groupByColumn.columnNameWithQuotes)] =
            group[groupByColumn.alias];

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

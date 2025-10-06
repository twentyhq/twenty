import { type ObjectRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import { type IEdge } from 'src/engine/api/graphql/workspace-query-runner/interfaces/edge.interface';
import { type IGroupByConnection } from 'src/engine/api/graphql/workspace-query-runner/interfaces/group-by-connection.interface';

import { removeQuotes } from 'src/engine/api/graphql/graphql-query-runner/group-by/resolvers/utils/remove-quote.util';

export const formatResultWithGroupByDimensionValues = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  result: any[],
  groupByColumnsWithQuotes: string[],
): IGroupByConnection<ObjectRecord, IEdge<ObjectRecord>>[] => {
  let formattedResult: IGroupByConnection<ObjectRecord, IEdge<ObjectRecord>>[] =
    [];

  result.forEach((group) => {
    let dimensionValues = [];

    for (const groupByColumn of groupByColumnsWithQuotes) {
      const groupByColumnWithoutQuotes = removeQuotes(groupByColumn);

      dimensionValues.push(group[groupByColumnWithoutQuotes]);
    }
    formattedResult.push({
      groupByDimensionValues: dimensionValues,
      ...group,
    });
  });

  return formattedResult;
};

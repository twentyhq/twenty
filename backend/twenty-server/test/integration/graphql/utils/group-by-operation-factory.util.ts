import gql from 'graphql-tag';
import { capitalize } from 'twenty-shared/utils';

type GroupByOperationFactoryParams = {
  objectMetadataSingularName: string;
  objectMetadataPluralName: string;
  orderByForRecords?: object[];
  groupBy: object[];
  filter?: object;
  orderBy?: object[];
  viewId?: string;
  gqlFields?: string;
  limit?: number;
};

export const groupByOperationFactory = ({
  objectMetadataSingularName,
  objectMetadataPluralName,
  groupBy,
  filter = {},
  orderBy = [],
  orderByForRecords = [],
  viewId,
  gqlFields,
  limit,
}: GroupByOperationFactoryParams) => ({
  query: gql`
    query ${capitalize(objectMetadataPluralName)}GroupBy($groupBy: [${capitalize(objectMetadataSingularName)}GroupByInput!]!, $filter: ${capitalize(objectMetadataSingularName)}FilterInput, $orderBy: [${capitalize(objectMetadataSingularName)}OrderByWithGroupByInput!], $viewId: UUID, $limit: Int) {
      ${objectMetadataPluralName}GroupBy(groupBy: $groupBy, filter: $filter, orderBy: $orderBy, viewId: $viewId, limit: $limit) {
        ${gqlFields ? gqlFields : ''}
        groupByDimensionValues
        totalCount
      }
    }
  `,
  variables: {
    groupBy,
    filter,
    orderBy,
    orderByForRecords,
    limit,
    ...(viewId && { viewId }),
  },
});

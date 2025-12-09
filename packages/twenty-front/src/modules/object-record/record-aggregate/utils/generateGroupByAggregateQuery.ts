import gql from 'graphql-tag';

import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getGroupByAggregateQueryName } from '@/object-record/record-aggregate/utils/getGroupByAggregateQueryName';
import { getGroupByQueryResultGqlFieldName } from '@/page-layout/utils/getGroupByQueryResultGqlFieldName';
import { capitalize } from 'twenty-shared/utils';

export const generateGroupByAggregateQuery = ({
  objectMetadataItem,
  aggregateOperationGqlFields,
}: {
  objectMetadataItem: ObjectMetadataItem;
  aggregateOperationGqlFields: string[];
}) => {
  const capitalizedSingular = capitalize(objectMetadataItem.nameSingular);
  const queryName = getGroupByAggregateQueryName({
    objectMetadataNamePlural: objectMetadataItem.namePlural,
  });
  const queryFieldName = getGroupByQueryResultGqlFieldName(objectMetadataItem);

  return gql`
    query ${queryName}(
      $groupBy: [${capitalizedSingular}GroupByInput!]!
      $filter: ${capitalizedSingular}FilterInput
      $orderBy: [${capitalizedSingular}OrderByWithGroupByInput!]
      $viewId: UUID
      $limit: Int
    ) {
      ${queryFieldName}(
        groupBy: $groupBy
        filter: $filter
        orderBy: $orderBy
        viewId: $viewId
        limit: $limit
      ) {
        groupByDimensionValues${aggregateOperationGqlFields.length > 0 ? `\n        ${aggregateOperationGqlFields.join('\n        ')}` : ''}
      }
    }
  `;
};

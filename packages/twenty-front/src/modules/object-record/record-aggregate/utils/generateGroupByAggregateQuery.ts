import gql from 'graphql-tag';

import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { capitalize } from 'twenty-shared/utils';
import { getGroupByQueryResultGqlFieldName } from '../../../page-layout/utils/getGroupByQueryResultGqlFieldName';

export const generateGroupByAggregateQuery = ({
  objectMetadataItem,
  aggregateOperationGqlFields,
}: {
  objectMetadataItem: ObjectMetadataItem;
  aggregateOperationGqlFields: string[];
}) => {
  const capitalizedSingular = capitalize(objectMetadataItem.nameSingular);
  const queryName = `${capitalize(objectMetadataItem.namePlural)}GroupBy`;
  const queryFieldName = getGroupByQueryResultGqlFieldName(objectMetadataItem);

  return gql`
    query ${queryName}(
      $groupBy: [${capitalizedSingular}GroupByInput!]!
      $filter: ${capitalizedSingular}FilterInput
      $orderBy: [${capitalizedSingular}OrderByWithGroupByInput!]
      $viewId: UUID
    ) {
      ${queryFieldName}(
        groupBy: $groupBy
        filter: $filter
        orderBy: $orderBy
        viewId: $viewId
      ) {
        groupByDimensionValues${aggregateOperationGqlFields.length > 0 ? `\n        ${aggregateOperationGqlFields.join('\n        ')}` : ''}
      }
    }
  `;
};

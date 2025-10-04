import gql from 'graphql-tag';

import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { capitalize } from 'twenty-shared/utils';

export const generateGroupByQuery = ({
  objectMetadataItem,
  aggregateOperations,
}: {
  objectMetadataItem: ObjectMetadataItem;
  aggregateOperations: string[];
}) => {
  const capitalizedSingular = capitalize(objectMetadataItem.nameSingular);
  const queryName = `${capitalize(objectMetadataItem.namePlural)}GroupBy`;

  return gql`
    query ${queryName}(
      $groupBy: [${capitalizedSingular}GroupByInput!]
      $filter: ${capitalizedSingular}FilterInput
      $orderBy: [${capitalizedSingular}OrderByWithGroupByInput!]
      $viewId: UUID
    ) {
      ${objectMetadataItem.namePlural}GroupBy(
        groupBy: $groupBy
        filter: $filter
        orderBy: $orderBy
        viewId: $viewId
      ) {
        groupByDimensionValues
        ${aggregateOperations.map((aggregateOperation) => `${aggregateOperation}`).join('\n')}
      }
    }
  `;
};

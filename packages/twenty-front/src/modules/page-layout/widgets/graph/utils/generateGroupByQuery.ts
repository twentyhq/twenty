import gql from 'graphql-tag';

import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { capitalize } from 'twenty-shared/utils';
import { getGroupByQueryName } from '../../../utils/getGroupByQueryName';

export const generateGroupByQuery = ({
  objectMetadataItem,
  aggregateOperations,
}: {
  objectMetadataItem: ObjectMetadataItem;
  aggregateOperations: string[];
}) => {
  const capitalizedSingular = capitalize(objectMetadataItem.nameSingular);
  const queryName = `${capitalize(objectMetadataItem.namePlural)}GroupBy`;
  const queryFieldName = getGroupByQueryName(objectMetadataItem);

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
        groupByDimensionValues${aggregateOperations.length > 0 ? `\n        ${aggregateOperations.join('\n        ')}` : ''}
      }
    }
  `;
};

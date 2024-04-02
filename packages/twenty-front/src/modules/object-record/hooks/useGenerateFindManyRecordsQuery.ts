import { gql } from '@apollo/client';
import { useRecoilValue } from 'recoil';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { mapObjectMetadataToGraphQLQuery } from '@/object-metadata/utils/mapObjectMetadataToGraphQLQuery';
import { capitalize } from '~/utils/string/capitalize';

export const useGenerateFindManyRecordsQuery = () => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  return ({
    objectMetadataItem,
    depth,
    queryFields,
    computeReferences = false,
  }: {
    objectMetadataItem: Pick<
      ObjectMetadataItem,
      'fields' | 'nameSingular' | 'namePlural'
    >;
    depth?: number;
    queryFields?: Record<string, any>;
    computeReferences?: boolean;
  }) => gql`
    query FindMany${capitalize(
      objectMetadataItem.namePlural,
    )}($filter: ${capitalize(
      objectMetadataItem.nameSingular,
    )}FilterInput, $orderBy: ${capitalize(
      objectMetadataItem.nameSingular,
    )}OrderByInput, $lastCursor: String, $limit: Float) {
      ${
        objectMetadataItem.namePlural
      }(filter: $filter, orderBy: $orderBy, first: $limit, after: $lastCursor){
        edges {
          node ${mapObjectMetadataToGraphQLQuery({
            objectMetadataItems,
            objectMetadataItem,
            depth,
            queryFields,
            computeReferences,
          })}
          cursor
        }
        pageInfo {
          hasNextPage
          startCursor
          endCursor
        }
        totalCount
      }
    }
  `;
};

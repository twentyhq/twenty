import { gql } from '@apollo/client';
import { useRecoilValue } from 'recoil';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { mapObjectMetadataToGraphQLQuery } from '@/object-metadata/utils/mapObjectMetadataToGraphQLQuery';
import { capitalize } from '~/utils/string/capitalize';

export const useGenerateFindManyRecordsQuery = () => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState());

  return ({
    objectMetadataItem,
    depth,
    eagerLoadedRelations,
  }: {
    objectMetadataItem: Pick<
      ObjectMetadataItem,
      'fields' | 'nameSingular' | 'namePlural'
    >;
    depth?: number;
    eagerLoadedRelations?: Record<string, any>;
  }) => gql`
    query FindMany${capitalize(
      objectMetadataItem.namePlural,
    )}($filter${capitalize(objectMetadataItem.nameSingular)}: ${capitalize(
      objectMetadataItem.nameSingular,
    )}FilterInput, $orderBy${capitalize(
      objectMetadataItem.nameSingular,
    )}: ${capitalize(
      objectMetadataItem.nameSingular,
    )}OrderByInput, $lastCursor${capitalize(
      objectMetadataItem.nameSingular,
    )}: String, $limit${capitalize(objectMetadataItem.nameSingular)}: Float) {
      ${objectMetadataItem.namePlural}(filter: $filter${capitalize(
        objectMetadataItem.nameSingular,
      )}, orderBy: $orderBy${capitalize(
        objectMetadataItem.nameSingular,
      )}, first: $limit${capitalize(
        objectMetadataItem.nameSingular,
      )}, after: $lastCursor${capitalize(objectMetadataItem.nameSingular)}){
        edges {
          node ${mapObjectMetadataToGraphQLQuery({
            objectMetadataItems,
            objectMetadataItem,
            depth,
            eagerLoadedRelations,
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

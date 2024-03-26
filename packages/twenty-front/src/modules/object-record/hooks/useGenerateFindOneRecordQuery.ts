import { gql } from '@apollo/client';
import { useRecoilValue } from 'recoil';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { mapObjectMetadataToGraphQLQuery } from '@/object-metadata/utils/mapObjectMetadataToGraphQLQuery';
import { capitalize } from '~/utils/string/capitalize';

export const useGenerateFindOneRecordQuery = () => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  return ({
    objectMetadataItem,
    depth,
    eagerLoadedRelations,
  }: {
    objectMetadataItem: Pick<ObjectMetadataItem, 'fields' | 'nameSingular'>;
    depth?: number;
    eagerLoadedRelations?: Record<string, any>;
  }) => {
    return gql`
      query FindOne${capitalize(
        objectMetadataItem.nameSingular,
      )}($objectRecordId: UUID!) {
        ${objectMetadataItem.nameSingular}(filter: {
          id: {
            eq: $objectRecordId
          }
        })${mapObjectMetadataToGraphQLQuery({
          objectMetadataItems,
          objectMetadataItem,
          depth,
          eagerLoadedRelations,
        })}
      }
  `;
  };
};

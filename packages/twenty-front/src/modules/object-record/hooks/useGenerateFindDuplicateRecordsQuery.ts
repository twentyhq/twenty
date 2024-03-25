import { gql } from '@apollo/client';
import { useRecoilValue } from 'recoil';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { mapObjectMetadataToGraphQLQuery } from '@/object-metadata/utils/mapObjectMetadataToGraphQLQuery';
import { capitalize } from '~/utils/string/capitalize';

export const getFindDuplicateRecordsQueryResponseField = (
  objectNameSingular: string,
) => `${objectNameSingular}Duplicates`;

export const useGenerateFindDuplicateRecordsQuery = () => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  return ({
    objectMetadataItem,
    depth,
  }: {
    objectMetadataItem: Pick<ObjectMetadataItem, 'fields' | 'nameSingular'>;
    depth?: number;
  }) => gql`
    query FindDuplicate${capitalize(objectMetadataItem.nameSingular)}($id: ID) {
      ${getFindDuplicateRecordsQueryResponseField(
        objectMetadataItem.nameSingular,
      )}(id: $id) {
        edges {
          node ${mapObjectMetadataToGraphQLQuery({
            objectMetadataItems,
            objectMetadataItem,
            depth,
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

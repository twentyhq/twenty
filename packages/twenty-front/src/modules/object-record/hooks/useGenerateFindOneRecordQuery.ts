import { gql } from '@apollo/client';
import { useRecoilValue } from 'recoil';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { mapObjectMetadataToGraphQLQuery } from '@/object-metadata/utils/mapObjectMetadataToGraphQLQuery';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { capitalize } from '~/utils/string/capitalize';

export const useGenerateFindOneRecordQuery = () => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  return ({
    objectMetadataItem,
    depth,
    objectRecord,
  }: {
    objectMetadataItem: Pick<ObjectMetadataItem, 'fields' | 'nameSingular'>;
    depth?: number;
    objectRecord?: ObjectRecord;
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
          objectRecord,
        })}
      }
  `;
  };
};

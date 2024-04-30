import gql from 'graphql-tag';
import { useRecoilValue } from 'recoil';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { mapObjectMetadataToGraphQLQuery } from '@/object-metadata/utils/mapObjectMetadataToGraphQLQuery';
import { RecordGqlOperationGqlRecordFields } from '@/object-record/graphql/types/RecordGqlOperationGqlRecordFields';
import { capitalize } from '~/utils/string/capitalize';

export const useFindOneRecordQuery = ({
  objectNameSingular,
  recordGqlFields,
}: {
  objectNameSingular: string;
  recordGqlFields?: RecordGqlOperationGqlRecordFields;
}) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const findOneRecordQuery = gql`
      query FindOne${capitalize(
        objectMetadataItem.nameSingular,
      )}($objectRecordId: ID!) {
        ${objectMetadataItem.nameSingular}(filter: {
          id: {
            eq: $objectRecordId
          }
        })${mapObjectMetadataToGraphQLQuery({
          objectMetadataItems,
          objectMetadataItem,
          recordGqlFields,
        })}
      },
  `;

  return {
    findOneRecordQuery,
  };
};

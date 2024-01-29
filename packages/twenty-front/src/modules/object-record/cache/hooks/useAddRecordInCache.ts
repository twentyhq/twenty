import { useApolloClient } from '@apollo/client';
import gql from 'graphql-tag';
import { useRecoilCallback } from 'recoil';

import { useMapFieldMetadataToGraphQLQuery } from '@/object-metadata/hooks/useMapFieldMetadataToGraphQLQuery';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useGenerateFindOneRecordQuery } from '@/object-record/hooks/useGenerateFindOneRecordQuery';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { capitalize } from '~/utils/string/capitalize';

export const useAddRecordInCache = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const mapFieldMetadataToGraphQLQuery = useMapFieldMetadataToGraphQLQuery();
  const apolloClient = useApolloClient();

  const generateFindOneRecordQuery = useGenerateFindOneRecordQuery();

  const findOneRecordQuery = generateFindOneRecordQuery({
    objectMetadataItem,
  });

  return useRecoilCallback(
    ({ set }) =>
      (record: ObjectRecord) => {
        apolloClient.writeFragment({
          id: `${capitalize(objectMetadataItem.nameSingular)}:${record.id}`,
          fragment: gql`
        fragment Create${capitalize(
          objectMetadataItem.nameSingular,
        )}InCache on ${capitalize(objectMetadataItem.nameSingular)} {
          __typename
          id
          ${objectMetadataItem.fields
            .map((field) => mapFieldMetadataToGraphQLQuery(field))
            .join('\n')}
        }
      `,
          data: {
            __typename: `${capitalize(objectMetadataItem.nameSingular)}`,
            ...record,
          },
        });

        // TODO: Turn into injectIntoFindOneRecordQueryCache
        apolloClient.writeQuery({
          query: findOneRecordQuery,
          variables: {
            objectRecordId: record.id,
          },
          data: {
            [objectMetadataItem.nameSingular]: {
              __typename: `${capitalize(objectMetadataItem.nameSingular)}`,
              ...record,
            },
          },
        });

        // TODO: remove this once we get rid of entityFieldsFamilyState
        set(recordStoreFamilyState(record.id), record);
      },
    [
      objectMetadataItem,
      apolloClient,
      mapFieldMetadataToGraphQLQuery,
      findOneRecordQuery,
    ],
  );
};

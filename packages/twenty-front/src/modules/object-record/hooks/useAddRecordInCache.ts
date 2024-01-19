import { useApolloClient } from '@apollo/client';
import gql from 'graphql-tag';
import { useRecoilCallback } from 'recoil';

import { useOptimisticEffect } from '@/apollo/optimistic-effect/hooks/useOptimisticEffect';
import { useMapFieldMetadataToGraphQLQuery } from '@/object-metadata/hooks/useMapFieldMetadataToGraphQLQuery';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { entityFieldsFamilyState } from '@/object-record/field/states/entityFieldsFamilyState';
import { useGenerateFindOneRecordQuery } from '@/object-record/hooks/useGenerateFindOneRecordQuery';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { capitalize } from '~/utils/string/capitalize';

export const useAddRecordInCache = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const mapFieldMetadataToGraphQLQuery = useMapFieldMetadataToGraphQLQuery();
  const apolloClient = useApolloClient();

  const { triggerOptimisticEffects } = useOptimisticEffect({
    objectNameSingular: objectMetadataItem.nameSingular,
  });

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

        // triggerOptimisticEffects({
        //   typename: `${capitalize(objectMetadataItem.nameSingular)}Edge`,
        //   createdRecords: [record],
        // });

        // TODO: remove this once we get rid of entityFieldsFamilyState
        set(entityFieldsFamilyState(record.id), record);
      },
    [
      objectMetadataItem,
      // triggerOptimisticEffects,
      apolloClient,
      mapFieldMetadataToGraphQLQuery,
      findOneRecordQuery,
    ],
  );
};

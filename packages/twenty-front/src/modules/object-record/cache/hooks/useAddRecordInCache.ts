import { useApolloClient } from '@apollo/client';
import gql from 'graphql-tag';
import { useRecoilCallback, useRecoilValue } from 'recoil';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { mapObjectMetadataToGraphQLQuery } from '@/object-metadata/utils/mapObjectMetadataToGraphQLQuery';
import { useInjectIntoFindOneRecordQueryCache } from '@/object-record/cache/hooks/useInjectIntoFindOneRecordQueryCache';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { capitalize } from '~/utils/string/capitalize';

export const useAddRecordInCache = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState());
  const apolloClient = useApolloClient();

  const { injectIntoFindOneRecordQueryCache } =
    useInjectIntoFindOneRecordQueryCache({
      objectMetadataItem,
    });

  return useRecoilCallback(
    ({ set }) =>
      (record: ObjectRecord) => {
        const fragment = gql`
          fragment Create${capitalize(
            objectMetadataItem.nameSingular,
          )}InCache on ${capitalize(
            objectMetadataItem.nameSingular,
          )} ${mapObjectMetadataToGraphQLQuery({
            objectMetadataItems,
            objectMetadataItem,
          })}
        `;

        const cachedObjectRecord = {
          __typename: `${capitalize(objectMetadataItem.nameSingular)}`,
          ...record,
        };

        apolloClient.writeFragment({
          id: `${capitalize(objectMetadataItem.nameSingular)}:${record.id}`,
          fragment,
          data: cachedObjectRecord,
        });

        // TODO: should we keep this here ? Or should the caller of createOneRecordInCache/createManyRecordsInCache be responsible for this ?
        injectIntoFindOneRecordQueryCache(cachedObjectRecord);

        // TODO: remove this once we get rid of entityFieldsFamilyState
        set(recordStoreFamilyState(record.id), record);
      },
    [
      objectMetadataItem,
      objectMetadataItems,
      apolloClient,
      injectIntoFindOneRecordQueryCache,
    ],
  );
};

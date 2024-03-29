import { useApolloClient } from '@apollo/client';
import gql from 'graphql-tag';
import { useRecoilCallback, useRecoilValue } from 'recoil';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { mapObjectMetadataToGraphQLQuery } from '@/object-metadata/utils/mapObjectMetadataToGraphQLQuery';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { capitalize } from '~/utils/string/capitalize';

export const useAddRecordInCache = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);
  const apolloClient = useApolloClient();

  return useRecoilCallback(
    ({ set }) =>
      (record: ObjectRecord, queryFields?: Record<string, any>) => {
        const fragment = gql`
          fragment Create${capitalize(
            objectMetadataItem.nameSingular,
          )}InCache on ${capitalize(
            objectMetadataItem.nameSingular,
          )} ${mapObjectMetadataToGraphQLQuery({
            objectMetadataItems,
            objectMetadataItem,
            queryFields,
            computeReferences: true,
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
      },
    [objectMetadataItem, objectMetadataItems, apolloClient],
  );
};

import { useCallback } from 'react';
import { useApolloClient } from '@apollo/client';
import { getOperationName } from '@apollo/client/utilities';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { capitalize } from '~/utils/string/capitalize';

type useEnrichOneRecordProps = {
  objectNameSingular: string;
};

export const useEnrichOneRecord = <T>({
  objectNameSingular,
}: useEnrichOneRecordProps) => {
  const { objectMetadataItem, enrichOneRecordMutation, findManyRecordsQuery } =
    useObjectMetadataItem({
      objectNameSingular,
    });

  const apolloClient = useApolloClient();

  const enrichOneRecord = useCallback(
    async (idToEnrich: string) => {
      const enrichdRecord = await apolloClient.mutate({
        mutation: enrichOneRecordMutation,
        variables: {
          idToEnrich,
        },
        refetchQueries: [getOperationName(findManyRecordsQuery) ?? ''],
      });

      return enrichdRecord.data[
        `create${capitalize(objectMetadataItem.nameSingular)}`
      ] as T;
    },
    [
      objectMetadataItem.nameSingular,
      apolloClient,
      enrichOneRecordMutation,
      findManyRecordsQuery,
    ],
  );

  return {
    enrichOneRecord,
  };
};

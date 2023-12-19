import { useCallback } from 'react';
import { useApolloClient } from '@apollo/client';
import { getOperationName } from '@apollo/client/utilities';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { capitalize } from '~/utils/string/capitalize';

type useExecuteQuickActionOnOneRecordProps = {
  objectNameSingular: string;
};

export const useExecuteQuickActionOnOneRecord = <T>({
  objectNameSingular,
}: useExecuteQuickActionOnOneRecordProps) => {
  const {
    objectMetadataItem,
    executeQuickActionOnOneRecordMutation,
    findManyRecordsQuery,
  } = useObjectMetadataItem({
    objectNameSingular,
  });

  const apolloClient = useApolloClient();

  const executeQuickActionOnOneRecord = useCallback(
    async (idToExecuteQuickActionOn: string) => {
      const executeQuickActionOnRecord = await apolloClient.mutate({
        mutation: executeQuickActionOnOneRecordMutation,
        variables: {
          idToExecuteQuickActionOn,
        },
        refetchQueries: [getOperationName(findManyRecordsQuery) ?? ''],
      });

      return executeQuickActionOnRecord.data[
        `executeQuickActionOn${capitalize(objectMetadataItem.nameSingular)}`
      ] as T;
    },
    [
      objectMetadataItem.nameSingular,
      apolloClient,
      executeQuickActionOnOneRecordMutation,
      findManyRecordsQuery,
    ],
  );

  return {
    executeQuickActionOnOneRecord,
  };
};

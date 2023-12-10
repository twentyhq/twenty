import { useApolloClient } from '@apollo/client';
import { getOperationName } from '@apollo/client/utilities';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { capitalize } from '~/utils/string/capitalize';

type useUpdateOneRecordProps = {
  objectNameSingular: string;
  refetchFindManyQuery?: boolean;
};

export const useUpdateOneRecord = <T>({
  objectNameSingular,
  refetchFindManyQuery = false,
}: useUpdateOneRecordProps) => {
  const {
    objectMetadataItem,
    updateOneRecordMutation,
    getRecordFromCache,
    findManyRecordsQuery,
  } = useObjectMetadataItem({
    objectNameSingular,
  });

  const apolloClient = useApolloClient();

  const updateOneRecord = async ({
    idToUpdate,
    input,
  }: {
    idToUpdate: string;
    input: Record<string, any>;
    forceRefetch?: boolean;
  }) => {
    const cachedRecord = getRecordFromCache(idToUpdate);

    const updatedRecord = await apolloClient.mutate({
      mutation: updateOneRecordMutation,
      variables: {
        idToUpdate: idToUpdate,
        input: {
          ...input,
        },
      },
      optimisticResponse: {
        [`update${capitalize(objectMetadataItem.nameSingular)}`]: {
          ...(cachedRecord ?? {}),
          ...input,
        },
      },
      refetchQueries: refetchFindManyQuery
        ? [getOperationName(findManyRecordsQuery) ?? '']
        : [],
    });

    if (!updatedRecord?.data) {
      return null;
    }

    return updatedRecord.data[
      `update${capitalize(objectMetadataItem.nameSingular)}`
    ] as T;
  };

  return {
    updateOneRecord,
  };
};

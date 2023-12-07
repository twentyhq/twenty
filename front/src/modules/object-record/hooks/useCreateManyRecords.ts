import { useApolloClient } from '@apollo/client';
import { v4 } from 'uuid';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { ObjectMetadataItemIdentifier } from '@/object-metadata/types/ObjectMetadataItemIdentifier';
import { useGenerateEmptyRecord } from '@/object-record/hooks/useGenerateEmptyRecord';
import { capitalize } from '~/utils/string/capitalize';

export const useCreateManyRecords = <T>({
  objectNameSingular,
}: ObjectMetadataItemIdentifier) => {
  const { objectMetadataItem, createManyRecordsMutation } =
    useObjectMetadataItem({
      objectNameSingular,
    });

  const { generateEmptyRecord } = useGenerateEmptyRecord({
    objectMetadataItem,
  });

  const apolloClient = useApolloClient();

  const createManyRecords = async (data: Record<string, any>[]) => {
    const withIds = data.map((record) => ({
      ...record,
      id: (record.id as string) ?? v4(),
    }));

    const createdObjects = await apolloClient.mutate({
      mutation: createManyRecordsMutation,
      variables: {
        data: withIds,
      },
      optimisticResponse: {
        [`create${capitalize(objectMetadataItem.namePlural)}`]: withIds.map(
          (record) => generateEmptyRecord(record.id),
        ),
      },
    });

    if (!createdObjects.data) {
      return null;
    }

    return createdObjects.data[`create${objectMetadataItem.namePlural}`] as T[];
  };

  return { createManyRecords };
};

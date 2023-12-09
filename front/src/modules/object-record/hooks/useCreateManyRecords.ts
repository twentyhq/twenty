import { useApolloClient } from '@apollo/client';
import { v4 } from 'uuid';

import { useOptimisticEffect } from '@/apollo/optimistic-effect/hooks/useOptimisticEffect';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { ObjectMetadataItemIdentifier } from '@/object-metadata/types/ObjectMetadataItemIdentifier';
import { useGenerateEmptyRecord } from '@/object-record/hooks/useGenerateEmptyRecord';
import { capitalize } from '~/utils/string/capitalize';

export const useCreateManyRecords = <T>({
  objectNameSingular,
}: ObjectMetadataItemIdentifier) => {
  const { triggerOptimisticEffects } = useOptimisticEffect({
    objectNameSingular,
  });

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

    withIds.forEach((record) => {
      triggerOptimisticEffects(
        `${capitalize(objectMetadataItem.nameSingular)}Edge`,
        generateEmptyRecord({ id: record.id }),
      );
    });

    const createdObjects = await apolloClient.mutate({
      mutation: createManyRecordsMutation,
      variables: {
        data: withIds,
      },
      optimisticResponse: {
        [`create${capitalize(objectMetadataItem.namePlural)}`]: withIds.map(
          (record) => generateEmptyRecord({ id: record.id }),
        ),
      },
    });

    if (!createdObjects.data) {
      return null;
    }

    const createdRecords =
      (createdObjects.data[
        `create${capitalize(objectMetadataItem.namePlural)}`
      ] as T[]) ?? [];

    createdRecords.forEach((record) => {
      triggerOptimisticEffects(
        `${capitalize(objectMetadataItem.nameSingular)}Edge`,
        record,
      );
    });

    return createdRecords;
  };

  return { createManyRecords };
};

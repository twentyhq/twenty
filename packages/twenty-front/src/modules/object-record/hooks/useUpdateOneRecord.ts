import { useApolloClient } from '@apollo/client';

import { useOptimisticEffect } from '@/apollo/optimistic-effect/hooks/useOptimisticEffect';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { sanitizeRecordInput } from '@/object-record/utils/sanitizeRecordInput';
import { capitalize } from '~/utils/string/capitalize';

type useUpdateOneRecordProps = {
  objectNameSingular: string;
};

export const useUpdateOneRecord = <T>({
  objectNameSingular,
}: useUpdateOneRecordProps) => {
  const { objectMetadataItem, updateOneRecordMutation, getRecordFromCache } =
    useObjectMetadataItem({
      objectNameSingular,
    });

  const { triggerOptimisticEffects } = useOptimisticEffect({
    objectNameSingular,
  });

  const apolloClient = useApolloClient();

  const updateOneRecord = async ({
    idToUpdate,
    updateOneRecordInput,
  }: {
    idToUpdate: string;
    updateOneRecordInput: Record<string, unknown>;
  }) => {
    const cachedRecord = getRecordFromCache(idToUpdate);

    const optimisticallyUpdatedRecord: Record<string, any> = {
      ...(cachedRecord ?? {}),
      ...updateOneRecordInput,
    };

    const sanitizedUpdateOneRecordInput = sanitizeRecordInput({
      objectMetadataItem,
      recordInput: updateOneRecordInput,
    });

    triggerOptimisticEffects({
      typename: `${capitalize(objectMetadataItem.nameSingular)}Edge`,
      updatedRecords: [optimisticallyUpdatedRecord],
    });

    const updatedRecord = await apolloClient.mutate({
      mutation: updateOneRecordMutation,
      variables: {
        idToUpdate,
        input: {
          ...sanitizedUpdateOneRecordInput,
        },
      },
      optimisticResponse: {
        [`update${capitalize(objectMetadataItem.nameSingular)}`]:
          optimisticallyUpdatedRecord,
      },
    });

    if (!updatedRecord?.data) {
      return null;
    }

    const updatedData = updatedRecord.data[
      `update${capitalize(objectMetadataItem.nameSingular)}`
    ] as T;

    return updatedData;
  };

  return {
    updateOneRecord,
  };
};

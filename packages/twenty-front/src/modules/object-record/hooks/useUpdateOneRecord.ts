import { useApolloClient } from '@apollo/client';

import { useGetRelationFieldsToOptimisticallyUpdate } from '@/apollo/optimistic-effect/hooks/useGetRelationFieldsToOptimisticallyUpdate';
import { triggerUpdateRecordOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerUpdateRecordOptimisticEffect';
import { triggerUpdateRelationFieldOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerUpdateRelationFieldOptimisticEffect';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { getUpdateOneRecordMutationResponseField } from '@/object-record/hooks/useGenerateUpdateOneRecordMutation';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { sanitizeRecordInput } from '@/object-record/utils/sanitizeRecordInput';
import { capitalize } from '~/utils/string/capitalize';

type useUpdateOneRecordProps = {
  objectNameSingular: string;
};

export const useUpdateOneRecord = <
  UpdatedObjectRecord extends ObjectRecord = ObjectRecord,
>({
  objectNameSingular,
}: useUpdateOneRecordProps) => {
  const { objectMetadataItem, updateOneRecordMutation, getRecordFromCache } =
    useObjectMetadataItem({ objectNameSingular });

  const getRelationFieldsToOptimisticallyUpdate =
    useGetRelationFieldsToOptimisticallyUpdate();

  const apolloClient = useApolloClient();

  const updateOneRecord = async ({
    idToUpdate,
    updateOneRecordInput,
  }: {
    idToUpdate: string;
    updateOneRecordInput: Partial<Omit<UpdatedObjectRecord, 'id'>>;
  }) => {
    const cachedRecord = getRecordFromCache<UpdatedObjectRecord>(idToUpdate);

    const sanitizedUpdateOneRecordInput = sanitizeRecordInput({
      objectMetadataItem,
      recordInput: updateOneRecordInput,
    });

    const optimisticallyUpdatedRecord = {
      ...(cachedRecord ?? {}),
      ...updateOneRecordInput,
      ...sanitizedUpdateOneRecordInput,
      __typename: capitalize(objectNameSingular),
      id: idToUpdate,
    };

    const updatedRelationFields = cachedRecord
      ? getRelationFieldsToOptimisticallyUpdate({
          cachedRecord,
          objectMetadataItem,
          updateRecordInput: updateOneRecordInput,
        })
      : [];

    const mutationResponseField =
      getUpdateOneRecordMutationResponseField(objectNameSingular);

    const updatedRecord = await apolloClient.mutate({
      mutation: updateOneRecordMutation,
      variables: {
        idToUpdate,
        input: sanitizedUpdateOneRecordInput,
      },
      optimisticResponse: {
        [mutationResponseField]: optimisticallyUpdatedRecord,
      },
      update: (cache, { data }) => {
        const record = data?.[mutationResponseField];

        if (!record) return;

        triggerUpdateRecordOptimisticEffect({
          cache,
          objectMetadataItem,
          record,
        });

        updatedRelationFields.forEach(
          ({
            relationObjectMetadataNameSingular,
            relationFieldName,
            previousRelationRecord,
            nextRelationRecord,
          }) =>
            triggerUpdateRelationFieldOptimisticEffect({
              cache,
              objectNameSingular,
              record,
              relationObjectMetadataNameSingular,
              relationFieldName,
              previousRelationRecord,
              nextRelationRecord,
            }),
        );
      },
    });

    return updatedRecord?.data?.[mutationResponseField] ?? null;
  };

  return {
    updateOneRecord,
  };
};

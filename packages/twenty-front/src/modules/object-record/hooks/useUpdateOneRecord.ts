import { useApolloClient } from '@apollo/client';

import { triggerUpdateRecordOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerUpdateRecordOptimisticEffect';
import { useGetRelationMetadata } from '@/object-metadata/hooks/useGetRelationMetadata';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useGenerateObjectRecordOptimisticResponse } from '@/object-record/cache/hooks/useGenerateObjectRecordOptimisticResponse';
import { getUpdateOneRecordMutationResponseField } from '@/object-record/hooks/useGenerateUpdateOneRecordMutation';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { sanitizeRecordInput } from '@/object-record/utils/sanitizeRecordInput';

type useUpdateOneRecordProps = {
  objectNameSingular: string;
};

export const useUpdateOneRecord = <
  UpdatedObjectRecord extends ObjectRecord = ObjectRecord,
>({
  objectNameSingular,
}: useUpdateOneRecordProps) => {
  const apolloClient = useApolloClient();

  const { objectMetadataItem, updateOneRecordMutation, getRecordFromCache } =
    useObjectMetadataItem({ objectNameSingular });

  const { generateObjectRecordOptimisticResponse } =
    useGenerateObjectRecordOptimisticResponse({
      objectMetadataItem,
    });

  const getRelationMetadata = useGetRelationMetadata();

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

    const optimisticallyUpdatedRecord = generateObjectRecordOptimisticResponse({
      ...(cachedRecord ?? {}),
      ...sanitizedUpdateOneRecordInput,
      id: idToUpdate,
    });

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

        if (!record || !cachedRecord) return;

        triggerUpdateRecordOptimisticEffect({
          cache,
          objectMetadataItem,
          previousRecord: cachedRecord,
          nextRecord: record,
          getRelationMetadata,
        });
      },
    });

    return updatedRecord?.data?.[mutationResponseField] ?? null;
  };

  return {
    updateOneRecord,
  };
};

import { useApolloClient } from '@apollo/client';

import { triggerCreateRecordsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerCreateRecordsOptimisticEffect';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { ObjectMetadataItemIdentifier } from '@/object-metadata/types/ObjectMetadataItemIdentifier';
import { useGenerateCachedObjectRecord } from '@/object-record/hooks/useGenerateCachedObjectRecord';
import { getCreateManyRecordsMutationResponseField } from '@/object-record/hooks/useGenerateCreateManyRecordMutation';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { sanitizeRecordInput } from '@/object-record/utils/sanitizeRecordInput';

export const useCreateManyRecords = <
  CreatedObjectRecord extends ObjectRecord = ObjectRecord,
>({
  objectNameSingular,
}: ObjectMetadataItemIdentifier) => {
  const { objectMetadataItem, createManyRecordsMutation } =
    useObjectMetadataItem({
      objectNameSingular,
    });

  const { generateCachedObjectRecord } = useGenerateCachedObjectRecord({
    objectMetadataItem,
  });

  const apolloClient = useApolloClient();

  const createManyRecords = async (data: Partial<CreatedObjectRecord>[]) => {
    const optimisticallyCreatedRecords = data.map((record) =>
      generateCachedObjectRecord<CreatedObjectRecord>(record),
    );

    const sanitizedCreateManyRecordsInput = data.map((input, index) =>
      sanitizeRecordInput({
        objectMetadataItem,
        recordInput: { ...input, id: optimisticallyCreatedRecords[index].id },
      }),
    );

    const mutationResponseField = getCreateManyRecordsMutationResponseField(
      objectMetadataItem.namePlural,
    );

    const createdObjects = await apolloClient.mutate({
      mutation: createManyRecordsMutation,
      variables: {
        data: sanitizedCreateManyRecordsInput,
      },
      optimisticResponse: {
        [mutationResponseField]: optimisticallyCreatedRecords,
      },
      update: (cache, { data }) => {
        const records = data?.[mutationResponseField];

        if (!records?.length) return;

        triggerCreateRecordsOptimisticEffect({
          cache,
          objectMetadataItem,
          records,
        });
      },
    });

    return createdObjects.data?.[mutationResponseField] ?? [];
  };

  return { createManyRecords };
};

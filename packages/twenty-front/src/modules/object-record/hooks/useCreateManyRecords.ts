import { useApolloClient } from '@apollo/client';
import { v4 } from 'uuid';

import { triggerCreateRecordsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerCreateRecordsOptimisticEffect';
import { useGetRelationMetadata } from '@/object-metadata/hooks/useGetRelationMetadata';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { ObjectMetadataItemIdentifier } from '@/object-metadata/types/ObjectMetadataItemIdentifier';
import { useGenerateObjectRecordOptimisticResponse } from '@/object-record/cache/hooks/useGenerateObjectRecordOptimisticResponse';
import { getCreateManyRecordsMutationResponseField } from '@/object-record/hooks/useGenerateCreateManyRecordMutation';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { sanitizeRecordInput } from '@/object-record/utils/sanitizeRecordInput';

export const useCreateManyRecords = <
  CreatedObjectRecord extends ObjectRecord = ObjectRecord,
>({
  objectNameSingular,
}: ObjectMetadataItemIdentifier) => {
  const apolloClient = useApolloClient();

  const { objectMetadataItem, createManyRecordsMutation } =
    useObjectMetadataItem({
      objectNameSingular,
    });

  const { generateObjectRecordOptimisticResponse } =
    useGenerateObjectRecordOptimisticResponse({
      objectMetadataItem,
    });

  const getRelationMetadata = useGetRelationMetadata();

  const createManyRecords = async (data: Partial<CreatedObjectRecord>[]) => {
    const sanitizedCreateManyRecordsInput = data.map((input) =>
      sanitizeRecordInput({
        objectMetadataItem,
        recordInput: { ...input, id: v4() },
      }),
    );

    const optimisticallyCreatedRecords = sanitizedCreateManyRecordsInput.map(
      (record) =>
        generateObjectRecordOptimisticResponse<CreatedObjectRecord>(record),
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
          getRelationMetadata,
        });
      },
    });

    return createdObjects.data?.[mutationResponseField] ?? [];
  };

  return { createManyRecords };
};

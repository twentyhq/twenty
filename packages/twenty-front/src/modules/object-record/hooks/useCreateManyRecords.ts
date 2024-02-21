import { useApolloClient } from '@apollo/client';
import { v4 } from 'uuid';

import { triggerCreateRecordsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerCreateRecordsOptimisticEffect';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { ObjectMetadataItemIdentifier } from '@/object-metadata/types/ObjectMetadataItemIdentifier';
import { useGenerateObjectRecordOptimisticResponse } from '@/object-record/cache/hooks/useGenerateObjectRecordOptimisticResponse';
import { getCreateManyRecordsMutationResponseField } from '@/object-record/hooks/useGenerateCreateManyRecordMutation';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { sanitizeRecordInput } from '@/object-record/utils/sanitizeRecordInput';

type CreateManyRecordsOptions = {
  skipOptimisticEffect?: boolean;
};

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

  const { objectMetadataItems } = useObjectMetadataItems();

  const createManyRecords = async (
    data: Partial<CreatedObjectRecord>[],
    options?: CreateManyRecordsOptions,
  ) => {
    const sanitizedCreateManyRecordsInput = data.map((input) => {
      const idForCreation = input.id ?? v4();

      const sanitizedRecordInput = sanitizeRecordInput({
        objectMetadataItem,
        recordInput: { ...input, id: idForCreation },
      });

      return sanitizedRecordInput;
    });

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
      optimisticResponse: options?.skipOptimisticEffect
        ? undefined
        : {
            [mutationResponseField]: optimisticallyCreatedRecords,
          },
      update: options?.skipOptimisticEffect
        ? undefined
        : (cache, { data }) => {
            const records = data?.[mutationResponseField];

            if (!records?.length) return;

            triggerCreateRecordsOptimisticEffect({
              cache,
              objectMetadataItem,
              recordsToCreate: records,
              objectMetadataItems,
            });
          },
    });

    return createdObjects.data?.[mutationResponseField] ?? [];
  };

  return { createManyRecords };
};

import { useApolloClient } from '@apollo/client';
import { v4 } from 'uuid';

import { triggerCreateRecordsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerCreateRecordsOptimisticEffect';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useGenerateObjectRecordOptimisticResponse } from '@/object-record/cache/hooks/useGenerateObjectRecordOptimisticResponse';
import { getCreateOneRecordMutationResponseField } from '@/object-record/hooks/useGenerateCreateOneRecordMutation';
import { useMapRelationRecordsToRelationConnection } from '@/object-record/hooks/useMapRelationRecordsToRelationConnection';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { sanitizeRecordInput } from '@/object-record/utils/sanitizeRecordInput';

type useCreateOneRecordProps = {
  objectNameSingular: string;
};

type CreateOneRecordOptions = {
  skipOptimisticEffect?: boolean;
};

export const useCreateOneRecord = <
  CreatedObjectRecord extends ObjectRecord = ObjectRecord,
>({
  objectNameSingular,
}: useCreateOneRecordProps) => {
  const apolloClient = useApolloClient();

  const { objectMetadataItem, createOneRecordMutation } = useObjectMetadataItem(
    { objectNameSingular },
  );

  const { generateObjectRecordOptimisticResponse } =
    useGenerateObjectRecordOptimisticResponse({
      objectMetadataItem,
    });

  const { mapRecordRelationRecordsToRelationConnection } =
    useMapRelationRecordsToRelationConnection();

  const { objectMetadataItems } = useObjectMetadataItems();

  const createOneRecord = async (
    input: Partial<CreatedObjectRecord>,
    options?: CreateOneRecordOptions,
  ) => {
    const idForCreation = input.id ?? v4();

    const inputWithNestedConnections =
      mapRecordRelationRecordsToRelationConnection({
        objectRecord: input,
        objectNameSingular,
      });

    const sanitizedCreateOneRecordInput = sanitizeRecordInput({
      objectMetadataItem,
      recordInput: { ...inputWithNestedConnections, id: idForCreation },
    });

    const optimisticallyCreatedRecord =
      generateObjectRecordOptimisticResponse<CreatedObjectRecord>({
        ...inputWithNestedConnections,
        ...sanitizedCreateOneRecordInput,
      });

    const mutationResponseField =
      getCreateOneRecordMutationResponseField(objectNameSingular);

    const createdObject = await apolloClient.mutate({
      mutation: createOneRecordMutation,
      variables: {
        input: sanitizedCreateOneRecordInput,
      },
      optimisticResponse: options?.skipOptimisticEffect
        ? undefined
        : {
            [mutationResponseField]: optimisticallyCreatedRecord,
          },
      update: options?.skipOptimisticEffect
        ? undefined
        : (cache, { data }) => {
            const record = data?.[mutationResponseField];

            if (!record) return;

            triggerCreateRecordsOptimisticEffect({
              cache,
              objectMetadataItem,
              recordsToCreate: [record],
              objectMetadataItems,
            });
          },
    });

    return createdObject.data?.[mutationResponseField] ?? null;
  };

  return {
    createOneRecord,
  };
};

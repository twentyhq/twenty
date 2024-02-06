import { useApolloClient } from '@apollo/client';
import { v4 } from 'uuid';

import { triggerCreateRecordsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerCreateRecordsOptimisticEffect';
import { useGetRelationMetadata } from '@/object-metadata/hooks/useGetRelationMetadata';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useGenerateObjectRecordOptimisticResponse } from '@/object-record/cache/hooks/useGenerateObjectRecordOptimisticResponse';
import { getCreateOneRecordMutationResponseField } from '@/object-record/hooks/useGenerateCreateOneRecordMutation';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { sanitizeRecordInput } from '@/object-record/utils/sanitizeRecordInput';

type useCreateOneRecordProps = {
  objectNameSingular: string;
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

  const getRelationMetadata = useGetRelationMetadata();

  const createOneRecord = async (input: Partial<CreatedObjectRecord>) => {
    const sanitizedCreateOneRecordInput = sanitizeRecordInput({
      objectMetadataItem,
      recordInput: { ...input, id: v4() },
    });

    const optimisticallyCreatedRecord =
      generateObjectRecordOptimisticResponse<CreatedObjectRecord>({
        ...input,
        ...sanitizedCreateOneRecordInput,
      });

    const mutationResponseField =
      getCreateOneRecordMutationResponseField(objectNameSingular);

    const createdObject = await apolloClient.mutate({
      mutation: createOneRecordMutation,
      variables: {
        input: sanitizedCreateOneRecordInput,
      },
      optimisticResponse: {
        [mutationResponseField]: optimisticallyCreatedRecord,
      },
      update: (cache, { data }) => {
        const record = data?.[mutationResponseField];

        if (!record) return;

        triggerCreateRecordsOptimisticEffect({
          cache,
          objectMetadataItem,
          records: [record],
          getRelationMetadata,
        });
      },
    });

    return createdObject.data?.[mutationResponseField] ?? null;
  };

  return {
    createOneRecord,
  };
};

import { useApolloClient } from '@apollo/client';

import { triggerCreateRecordsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerCreateRecordsOptimisticEffect';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useGenerateCachedObjectRecord } from '@/object-record/hooks/useGenerateCachedObjectRecord';
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
  const { objectMetadataItem, createOneRecordMutation } = useObjectMetadataItem(
    { objectNameSingular },
  );

  // TODO: type this with a minimal type at least with Record<string, any>
  const apolloClient = useApolloClient();

  const { generateCachedObjectRecord } = useGenerateCachedObjectRecord({
    objectMetadataItem,
  });

  const createOneRecord = async (input: Partial<CreatedObjectRecord>) => {
    const optimisticallyCreatedRecord =
      generateCachedObjectRecord<CreatedObjectRecord>(input);

    const sanitizedCreateOneRecordInput = sanitizeRecordInput({
      objectMetadataItem,
      recordInput: { ...input, id: optimisticallyCreatedRecord.id },
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
        });
      },
    });

    return createdObject.data?.[mutationResponseField] ?? null;
  };

  return {
    createOneRecord,
  };
};

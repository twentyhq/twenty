import { useApolloClient } from '@apollo/client';

import { triggerUpdateRecordOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerUpdateRecordOptimisticEffect';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useGenerateObjectRecordOptimisticResponse } from '@/object-record/cache/hooks/useGenerateObjectRecordOptimisticResponse';
import { getUpdateOneRecordMutationResponseField } from '@/object-record/hooks/useGenerateUpdateOneRecordMutation';
import { useMapRelationRecordsToRelationConnection } from '@/object-record/hooks/useMapRelationRecordsToRelationConnection';
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
    useObjectMetadataItem({ objectNameSingular }, 1);

  const { generateObjectRecordOptimisticResponse } =
    useGenerateObjectRecordOptimisticResponse({
      objectMetadataItem,
    });

  const { objectMetadataItems } = useObjectMetadataItems();
  const { mapRecordRelationRecordsToRelationConnection } =
    useMapRelationRecordsToRelationConnection();

  const updateOneRecord = async ({
    idToUpdate,
    updateOneRecordInput,
  }: {
    idToUpdate: string;
    updateOneRecordInput: Partial<Omit<UpdatedObjectRecord, 'id'>>;
  }) => {
    const cachedRecord = getRecordFromCache<UpdatedObjectRecord>(idToUpdate);

    const updateOneRecordInputWithNestedConnections =
      mapRecordRelationRecordsToRelationConnection({
        objectRecord: updateOneRecordInput,
        objectNameSingular,
      });

    if (!updateOneRecordInputWithNestedConnections) {
      throw new Error('Record to update with nested connections is undefined');
    }

    const sanitizedUpdateOneRecordInput = sanitizeRecordInput({
      objectMetadataItem,
      recordInput: updateOneRecordInputWithNestedConnections,
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
          currentRecord: cachedRecord,
          updatedRecord: record,
          objectMetadataItems,
        });
      },
    });

    return updatedRecord?.data?.[mutationResponseField] ?? null;
  };

  return {
    updateOneRecord,
  };
};

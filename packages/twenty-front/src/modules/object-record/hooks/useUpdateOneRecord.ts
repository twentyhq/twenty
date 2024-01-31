import { useApolloClient } from '@apollo/client';

import { isObjectRecordConnection } from '@/apollo/optimistic-effect/utils/isObjectRecordConnection';
import { triggerAttachRelationOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerAttachRelationOptimisticEffect';
import { triggerDetachRelationOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerDetachRelationOptimisticEffect';
import { triggerUpdateRecordOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerUpdateRecordOptimisticEffect';
import { useGetRelationMetadata } from '@/object-metadata/hooks/useGetRelationMetadata';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { getUpdateOneRecordMutationResponseField } from '@/object-record/hooks/useGenerateUpdateOneRecordMutation';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { sanitizeRecordInput } from '@/object-record/utils/sanitizeRecordInput';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';
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

  const getRelationMetadata = useGetRelationMetadata();

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

        objectMetadataItem.fields.forEach((fieldMetadataItem) => {
          const relationMetadata = getRelationMetadata({ fieldMetadataItem });

          if (!relationMetadata) return;

          const { relationObjectMetadataItem, relationFieldMetadataItem } =
            relationMetadata;

          const previousFieldValue = cachedRecord?.[fieldMetadataItem.name];
          const nextFieldValue =
            updateOneRecordInput[fieldMetadataItem.name] ?? null;

          if (
            !(fieldMetadataItem.name in updateOneRecordInput) ||
            isObjectRecordConnection(
              relationObjectMetadataItem.nameSingular,
              previousFieldValue,
            ) ||
            isDeeplyEqual(previousFieldValue, nextFieldValue)
          ) {
            return;
          }

          if (previousFieldValue) {
            triggerDetachRelationOptimisticEffect({
              cache,
              objectNameSingular,
              recordId: record.id,
              relationObjectMetadataNameSingular:
                relationObjectMetadataItem.nameSingular,
              relationFieldName: relationFieldMetadataItem.name,
              relationRecordId: previousFieldValue.id,
            });
          }

          if (nextFieldValue) {
            triggerAttachRelationOptimisticEffect({
              cache,
              objectNameSingular,
              recordId: record.id,
              relationObjectMetadataNameSingular:
                relationObjectMetadataItem.nameSingular,
              relationFieldName: relationFieldMetadataItem.name,
              relationRecordId: nextFieldValue.id,
            });
          }
        });

        triggerUpdateRecordOptimisticEffect({
          cache,
          objectMetadataItem,
          record,
        });
      },
    });

    return updatedRecord?.data?.[mutationResponseField] ?? null;
  };

  return {
    updateOneRecord,
  };
};

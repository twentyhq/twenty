import { useApolloClient } from '@apollo/client';
import { v4 } from 'uuid';

import { useOptimisticEffect } from '@/apollo/optimistic-effect/hooks/useOptimisticEffect';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useGenerateEmptyRecord } from '@/object-record/hooks/useGenerateEmptyRecord';
import { sanitizeRecordInput } from '@/object-record/utils/sanitizeRecordInput';
import { capitalize } from '~/utils/string/capitalize';

type useCreateOneRecordProps = {
  objectNameSingular: string;
};

export const useCreateOneRecord = <T>({
  objectNameSingular,
}: useCreateOneRecordProps) => {
  const { triggerOptimisticEffects } = useOptimisticEffect({
    objectNameSingular,
  });

  const { objectMetadataItem, createOneRecordMutation } = useObjectMetadataItem(
    {
      objectNameSingular,
    },
  );

  // TODO: type this with a minimal type at least with Record<string, any>
  const apolloClient = useApolloClient();

  const { generateEmptyRecord } = useGenerateEmptyRecord({
    objectMetadataItem,
  });

  const createOneRecord = async (input: Record<string, any>) => {
    const recordId = v4();

    const generatedEmptyRecord = generateEmptyRecord<Record<string, unknown>>({
      id: recordId,
      createdAt: new Date().toISOString(),
      ...input,
    });

    const sanitizedUpdateOneRecordInput = sanitizeRecordInput({
      objectMetadataItem,
      recordInput: input,
    });

    triggerOptimisticEffects({
      typename: `${capitalize(objectMetadataItem.nameSingular)}Edge`,
      createdRecords: [generatedEmptyRecord],
    });

    const createdObject = await apolloClient.mutate({
      mutation: createOneRecordMutation,
      variables: {
        input: { id: recordId, ...sanitizedUpdateOneRecordInput },
      },
      optimisticResponse: {
        [`create${capitalize(objectMetadataItem.nameSingular)}`]:
          generatedEmptyRecord,
      },
    });

    if (!createdObject.data) {
      return null;
    }

    return createdObject.data[
      `create${capitalize(objectMetadataItem.nameSingular)}`
    ] as T;
  };

  return {
    createOneRecord,
  };
};

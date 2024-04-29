import { useApolloClient } from '@apollo/client';
import { v4 } from 'uuid';

import { triggerCreateRecordsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerCreateRecordsOptimisticEffect';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useCreateOneRecordInCache } from '@/object-record/cache/hooks/useCreateOneRecordInCache';
import { getObjectTypename } from '@/object-record/cache/utils/getObjectTypename';
import { RecordGqlOperationGqlRecordFields } from '@/object-record/graphql-operations/types/RecordGqlOperationGqlRecordFields';
import { useCreateOneRecordMutation } from '@/object-record/hooks/useCreateOneRecordMutation';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { getCreateOneRecordMutationResponseField } from '@/object-record/utils/getCreateOneRecordMutationResponseField';
import { sanitizeRecordInput } from '@/object-record/utils/sanitizeRecordInput';
import { isDefined } from '~/utils/isDefined';

type useCreateOneRecordProps = {
  objectNameSingular: string;
  recordGqlFields?: RecordGqlOperationGqlRecordFields;
  skipPostOptmisticEffect?: boolean;
};

export const useCreateOneRecord = <
  CreatedObjectRecord extends ObjectRecord = ObjectRecord,
>({
  objectNameSingular,
  recordGqlFields,
  skipPostOptmisticEffect = false,
}: useCreateOneRecordProps) => {
  const apolloClient = useApolloClient();

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { createOneRecordMutation } = useCreateOneRecordMutation({
    objectNameSingular,
    recordGqlFields,
  });

  const createOneRecordInCache = useCreateOneRecordInCache<ObjectRecord>({
    objectMetadataItem,
  });

  const { objectMetadataItems } = useObjectMetadataItems();

  const createOneRecord = async (input: Partial<CreatedObjectRecord>) => {
    const idForCreation = input.id ?? v4();

    const sanitizedInput = {
      ...sanitizeRecordInput({
        objectMetadataItem,
        recordInput: input,
      }),
      id: idForCreation,
    };

    const recordCreatedInCache = createOneRecordInCache({
      ...input,
      id: idForCreation,
      __typename: getObjectTypename(objectMetadataItem.nameSingular),
    });

    if (isDefined(recordCreatedInCache)) {
      triggerCreateRecordsOptimisticEffect({
        cache: apolloClient.cache,
        objectMetadataItem,
        recordsToCreate: [recordCreatedInCache],
        objectMetadataItems,
      });
    }

    const mutationResponseField =
      getCreateOneRecordMutationResponseField(objectNameSingular);

    const createdObject = await apolloClient.mutate({
      mutation: createOneRecordMutation,
      variables: {
        input: sanitizedInput,
      },
      update: (cache, { data }) => {
        const record = data?.[mutationResponseField];

        if (!record || skipPostOptmisticEffect) return;

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

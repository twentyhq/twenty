import { useApolloClient } from '@apollo/client';
import { v4 } from 'uuid';

import { triggerCreateRecordsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerCreateRecordsOptimisticEffect';
import { CachedObjectRecord } from '@/apollo/types/CachedObjectRecord';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useCreateOneRecordInCache } from '@/object-record/cache/hooks/useCreateOneRecordInCache';
import {
  getCreateOneRecordMutationResponseField,
  useGenerateCreateOneRecordMutation,
} from '@/object-record/hooks/useGenerateCreateOneRecordMutation';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { sanitizeRecordInput } from '@/object-record/utils/sanitizeRecordInput';
import { isDefined } from '~/utils/isDefined';

type useCreateOneRecordProps = {
  objectNameSingular: string;
  queryFields?: Record<string, any>;
  depth?: number;
  skipPostOptmisticEffect?: boolean;
};

export const useCreateOneRecord = <
  CreatedObjectRecord extends ObjectRecord = ObjectRecord,
>({
  objectNameSingular,
  queryFields,
  depth = 1,
  skipPostOptmisticEffect = false,
}: useCreateOneRecordProps) => {
  const apolloClient = useApolloClient();

  const { objectMetadataItem } = useObjectMetadataItem({ objectNameSingular });

  const createOneRecordMutation = useGenerateCreateOneRecordMutation({
    objectMetadataItem,
    queryFields,
    depth,
  });

  const createOneRecordInCache = useCreateOneRecordInCache<CachedObjectRecord>({
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

import { useLazyQuery, type WatchQueryFetchPolicy } from '@apollo/client';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { type ObjectMetadataItemIdentifier } from '@/object-metadata/types/ObjectMetadataItemIdentifier';
import { getRecordFromRecordNode } from '@/object-record/cache/utils/getRecordFromRecordNode';
import { useGenerateDepthRecordGqlFieldsFromObject } from '@/object-record/graphql/record-gql-fields/hooks/useGenerateDepthRecordGqlFieldsFromObject';
import { type RecordGqlOperationGqlRecordFields } from '@/object-record/graphql/types/RecordGqlOperationGqlRecordFields';
import { useFindOneRecordQuery } from '@/object-record/hooks/useFindOneRecordQuery';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

type UseLazyFindOneRecordParams = ObjectMetadataItemIdentifier & {
  recordGqlFields?: RecordGqlOperationGqlRecordFields;
  withSoftDeleted?: boolean;
  fetchPolicy?: WatchQueryFetchPolicy;
};

type FindOneRecordParams<T extends ObjectRecord> = {
  objectRecordId: string | undefined;
  onCompleted?: (data: T) => void;
};

export const useLazyFindOneRecord = <T extends ObjectRecord = ObjectRecord>({
  objectNameSingular,
  recordGqlFields,
  withSoftDeleted = false,
  fetchPolicy = 'cache-first',
}: UseLazyFindOneRecordParams) => {
  const apolloCoreClient = useApolloCoreClient();

  const { recordGqlFields: depthOneRecordGqlFields } =
    useGenerateDepthRecordGqlFieldsFromObject({
      objectNameSingular,
      depth: 1,
    });

  const { findOneRecordQuery } = useFindOneRecordQuery({
    objectNameSingular,
    recordGqlFields: recordGqlFields ?? depthOneRecordGqlFields,
    withSoftDeleted,
  });

  const [findOneRecord, { loading, error, data, called }] = useLazyQuery(
    findOneRecordQuery,
    {
      client: apolloCoreClient,
    },
  );

  return {
    findOneRecord: async ({
      objectRecordId,
      onCompleted,
    }: FindOneRecordParams<T>) => {
      await findOneRecord({
        variables: { objectRecordId },
        fetchPolicy,
        onCompleted: (data) => {
          const record = getRecordFromRecordNode<T>({
            recordNode: data[objectNameSingular],
          });
          onCompleted?.(record);
        },
      });
    },
    called,
    error,
    loading,
    record: data?.[objectNameSingular] || undefined,
  };
};

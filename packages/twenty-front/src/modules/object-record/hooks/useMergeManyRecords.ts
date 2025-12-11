import { useCallback, useState } from 'react';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useGenerateDepthRecordGqlFieldsFromObject } from '@/object-record/graphql/record-gql-fields/hooks/useGenerateDepthRecordGqlFieldsFromObject';
import { type RecordGqlOperationGqlRecordFields } from '@/object-record/graphql/types/RecordGqlOperationGqlRecordFields';
import { useFindDuplicateRecordsQuery } from '@/object-record/hooks/useFindDuplicatesRecordsQuery';
import { useFindOneRecordQuery } from '@/object-record/hooks/useFindOneRecordQuery';
import { useMergeManyRecordsMutation } from '@/object-record/hooks/useMergeManyRecordsMutation';
import { useRefetchAggregateQueries } from '@/object-record/hooks/useRefetchAggregateQueries';
import { useRegisterObjectOperation } from '@/object-record/hooks/useRegisterObjectOperation';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { getMergeManyRecordsMutationResponseField } from '@/object-record/utils/getMergeManyRecordsMutationResponseField';
import { getOperationName } from '@apollo/client/utilities';

export type MergeManySettings = {
  conflictPriorityIndex: number;
};

export type UseMergeManyRecordsProps = {
  objectNameSingular: string;
  recordGqlFields?: RecordGqlOperationGqlRecordFields;
};

export const useMergeManyRecords = <
  MergedObjectRecord extends ObjectRecord = ObjectRecord,
>({
  objectNameSingular,
  recordGqlFields,
}: UseMergeManyRecordsProps) => {
  const { registerObjectOperation } = useRegisterObjectOperation();
  const apolloCoreClient = useApolloCoreClient();
  const [loading, setLoading] = useState(false);

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { recordGqlFields: depthOneRecordGqlFields } =
    useGenerateDepthRecordGqlFieldsFromObject({
      objectNameSingular,
      depth: 1,
    });

  const computedRecordGqlFields = recordGqlFields ?? depthOneRecordGqlFields;

  const { mergeManyRecordsMutation } = useMergeManyRecordsMutation({
    objectNameSingular,
    recordGqlFields: computedRecordGqlFields,
  });

  const { refetchAggregateQueries } = useRefetchAggregateQueries({
    objectMetadataNamePlural: objectMetadataItem.namePlural,
  });

  const { findOneRecordQuery } = useFindOneRecordQuery({
    objectNameSingular,
    recordGqlFields: computedRecordGqlFields,
  });

  const { findDuplicateRecordsQuery } = useFindDuplicateRecordsQuery({
    objectNameSingular,
  });

  type MergeManyRecordsProps = {
    recordIds: string[];
    mergeSettings: MergeManySettings;
    preview?: boolean;
  };

  const mergeManyRecords = useCallback(
    async ({
      recordIds,
      mergeSettings,
      preview = false,
    }: MergeManyRecordsProps): Promise<MergedObjectRecord | null> => {
      setLoading(true);

      const mutationResponseField = getMergeManyRecordsMutationResponseField(
        objectMetadataItem.namePlural,
      );

      try {
        const mergedObject = await apolloCoreClient.mutate({
          mutation: mergeManyRecordsMutation,
          variables: {
            ids: recordIds,
            conflictPriorityIndex: mergeSettings.conflictPriorityIndex,
            dryRun: preview,
          },
          // Prevent cache updates during dry run to avoid overwriting original record data
          ...(preview && {
            fetchPolicy: 'no-cache',
            errorPolicy: 'ignore',
          }),
          refetchQueries: [
            getOperationName(findOneRecordQuery) ?? '',
            getOperationName(findDuplicateRecordsQuery) ?? '',
          ].filter(Boolean),
        });

        setLoading(false);

        if (!preview) {
          await refetchAggregateQueries();
          registerObjectOperation(objectMetadataItem, {
            type: 'merge-records',
          });
        }

        return mergedObject.data?.[mutationResponseField] ?? null;
      } catch (error) {
        setLoading(false);
        throw error;
      }
    },
    [
      objectMetadataItem,
      apolloCoreClient,
      mergeManyRecordsMutation,
      findOneRecordQuery,
      findDuplicateRecordsQuery,
      refetchAggregateQueries,
      registerObjectOperation,
    ],
  );

  return {
    mergeManyRecords,
    loading,
  };
};

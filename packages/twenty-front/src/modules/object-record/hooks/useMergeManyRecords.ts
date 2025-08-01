import { useCallback, useState } from 'react';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { RecordGqlOperationGqlRecordFields } from '@/object-record/graphql/types/RecordGqlOperationGqlRecordFields';
import { generateDepthOneRecordGqlFields } from '@/object-record/graphql/utils/generateDepthOneRecordGqlFields';
import { useFindDuplicateRecordsQuery } from '@/object-record/hooks/useFindDuplicatesRecordsQuery';
import { useFindOneRecordQuery } from '@/object-record/hooks/useFindOneRecordQuery';
import { useMergeManyRecordsMutation } from '@/object-record/hooks/useMergeManyRecordsMutation';
import { useRefetchAggregateQueries } from '@/object-record/hooks/useRefetchAggregateQueries';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
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
  const apolloCoreClient = useApolloCoreClient();
  const [loading, setLoading] = useState(false);

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const computedRecordGqlFields =
    recordGqlFields ?? generateDepthOneRecordGqlFields({ objectMetadataItem });

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
        }

        return mergedObject.data?.[mutationResponseField] ?? null;
      } catch (error) {
        setLoading(false);
        throw error;
      }
    },
    [
      apolloCoreClient,
      findDuplicateRecordsQuery,
      findOneRecordQuery,
      mergeManyRecordsMutation,
      objectMetadataItem.namePlural,
      refetchAggregateQueries,
    ],
  );

  return {
    mergeManyRecords,
    loading,
  };
};

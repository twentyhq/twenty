import { useQuery } from '@apollo/client';
import { useMemo } from 'react';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { type ObjectMetadataItemIdentifier } from '@/object-metadata/types/ObjectMetadataItemIdentifier';
import { getRecordsFromRecordConnection } from '@/object-record/cache/utils/getRecordsFromRecordConnection';
import { type RecordGqlConnectionEdgesRequired } from '@/object-record/graphql/types/RecordGqlConnectionEdgesRequired';
import { type RecordGqlOperationFindDuplicatesResult } from '@/object-record/graphql/types/RecordGqlOperationFindDuplicatesResults';
import { useFindDuplicateRecordsQuery } from '@/object-record/hooks/useFindDuplicatesRecordsQuery';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { getFindDuplicateRecordsQueryResponseField } from '@/object-record/utils/getFindDuplicateRecordsQueryResponseField';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { logError } from '~/utils/logError';

export const useFindDuplicateRecords = <T extends ObjectRecord = ObjectRecord>({
  objectRecordIds = [],
  objectNameSingular,
  onCompleted,
  skip,
}: ObjectMetadataItemIdentifier & {
  objectRecordIds: string[] | undefined;
  onCompleted?: (data: RecordGqlConnectionEdgesRequired[]) => void;
  skip?: boolean;
}) => {
  const findDuplicateQueryStateIdentifier = objectNameSingular;

  const apolloCoreClient = useApolloCoreClient();

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { findDuplicateRecordsQuery } = useFindDuplicateRecordsQuery({
    objectNameSingular,
  });

  const { enqueueErrorSnackBar } = useSnackBar();

  const queryResponseField = getFindDuplicateRecordsQueryResponseField(
    objectMetadataItem.nameSingular,
  );

  const { data, loading, error } =
    useQuery<RecordGqlOperationFindDuplicatesResult>(
      findDuplicateRecordsQuery,
      {
        skip: !!skip,
        variables: {
          ids: objectRecordIds,
        },
        client: apolloCoreClient,
        onCompleted: (data) => {
          onCompleted?.(data[queryResponseField]);
        },
        onError: (error) => {
          logError(
            `useFindDuplicateRecords for "${objectMetadataItem.nameSingular}" error : ` +
              error,
          );
          enqueueErrorSnackBar({
            apolloError: error,
          });
        },
      },
    );

  const objectResults = data?.[queryResponseField];

  const results = useMemo(
    () =>
      objectResults?.map((result: RecordGqlConnectionEdgesRequired) => {
        return result
          ? (getRecordsFromRecordConnection({
              recordConnection: result,
            }) as T[])
          : [];
      }),
    [objectResults],
  );

  return {
    objectMetadataItem,
    results,
    loading,
    error,
    queryStateIdentifier: findDuplicateQueryStateIdentifier,
  };
};

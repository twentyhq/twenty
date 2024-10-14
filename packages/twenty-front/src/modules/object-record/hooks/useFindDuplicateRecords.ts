import { useQuery } from '@apollo/client';
import { useMemo } from 'react';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { ObjectMetadataItemIdentifier } from '@/object-metadata/types/ObjectMetadataItemIdentifier';
import { getRecordsFromRecordConnection } from '@/object-record/cache/utils/getRecordsFromRecordConnection';
import { RecordGqlConnection } from '@/object-record/graphql/types/RecordGqlConnection';
import { RecordGqlOperationFindDuplicatesResult } from '@/object-record/graphql/types/RecordGqlOperationFindDuplicatesResults';
import { useFindDuplicateRecordsQuery } from '@/object-record/hooks/useFindDuplicatesRecordsQuery';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { getFindDuplicateRecordsQueryResponseField } from '@/object-record/utils/getFindDuplicateRecordsQueryResponseField';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { logError } from '~/utils/logError';

export const useFindDuplicateRecords = <T extends ObjectRecord = ObjectRecord>({
  objectRecordIds = [],
  objectNameSingular,
  onCompleted,
}: ObjectMetadataItemIdentifier & {
  objectRecordIds: string[] | undefined;
  onCompleted?: (data: RecordGqlConnection[]) => void;
  skip?: boolean;
}) => {
  const findDuplicateQueryStateIdentifier = objectNameSingular;

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { findDuplicateRecordsQuery } = useFindDuplicateRecordsQuery({
    objectNameSingular,
  });

  const { enqueueSnackBar } = useSnackBar();

  const queryResponseField = getFindDuplicateRecordsQueryResponseField(
    objectMetadataItem.nameSingular,
  );

  const { data, loading, error } =
    useQuery<RecordGqlOperationFindDuplicatesResult>(
      findDuplicateRecordsQuery,
      {
        variables: {
          ids: objectRecordIds,
        },
        onCompleted: (data) => {
          onCompleted?.(data[queryResponseField]);
        },
        onError: (error) => {
          logError(
            `useFindDuplicateRecords for "${objectMetadataItem.nameSingular}" error : ` +
              error,
          );
          enqueueSnackBar(`Error finding duplicates:", ${error.message}`, {
            variant: SnackBarVariant.Error,
          });
        },
      },
    );

  const objectResults = data?.[queryResponseField];

  const results = useMemo(
    () =>
      objectResults?.map((result: RecordGqlConnection) => {
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

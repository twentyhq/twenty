import { useMemo } from 'react';
import { useQuery } from '@apollo/client';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { ObjectMetadataItemIdentifier } from '@/object-metadata/types/ObjectMetadataItemIdentifier';
import { useMapConnectionToRecords } from '@/object-record/hooks/useMapConnectionToRecords';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { ObjectRecordConnection } from '@/object-record/types/ObjectRecordConnection';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { logError } from '~/utils/logError';

import { ObjectRecordQueryResult } from '../types/ObjectRecordQueryResult';

export const useFindDuplicateRecords = <T extends ObjectRecord = ObjectRecord>({
  objectRecordId = '',
  objectNameSingular,
  onCompleted,
  depth,
}: ObjectMetadataItemIdentifier & {
  objectRecordId: string | undefined;
  onCompleted?: (data: ObjectRecordConnection<T>) => void;
  skip?: boolean;
  depth?: number;
}) => {
  const findDuplicateQueryStateIdentifier = objectNameSingular;

  const { objectMetadataItem, findDuplicateRecordsQuery } =
    useObjectMetadataItem({ objectNameSingular }, depth);

  const { enqueueSnackBar } = useSnackBar();

  const { data, loading, error } = useQuery<ObjectRecordQueryResult<T>>(
    findDuplicateRecordsQuery,
    {
      variables: {
        id: objectRecordId,
      },
      onCompleted: (data) => {
        onCompleted?.(data[objectMetadataItem.nameSingular]);
      },
      onError: (error) => {
        logError(
          `useFindDuplicateRecords for "${objectMetadataItem.nameSingular}" error : ` +
            error,
        );
        enqueueSnackBar(
          `Error during useFindDuplicateRecords for "${objectMetadataItem.nameSingular}", ${error.message}`,
          {
            variant: 'error',
          },
        );
      },
    },
  );

  const objectRecordConnection =
    data?.[`${objectMetadataItem.nameSingular}Duplicates`];

  const mapConnectionToRecords = useMapConnectionToRecords();

  const records = useMemo(
    () =>
      mapConnectionToRecords({
        objectRecordConnection,
        objectNameSingular,
        depth: 5,
      }) as T[],
    [mapConnectionToRecords, objectRecordConnection, objectNameSingular],
  );

  return {
    objectMetadataItem,
    records,
    totalCount: objectRecordConnection?.totalCount || 0,
    loading,
    error,
    queryStateIdentifier: findDuplicateQueryStateIdentifier,
  };
};

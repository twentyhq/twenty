import { useQuery } from '@apollo/client/react';
import { isDefined } from 'twenty-shared/utils';
import { useMemo } from 'react';

import { useSnackBarOnQueryError } from '@/apollo/hooks/useSnackBarOnQueryError';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { type ObjectMetadataItemIdentifier } from '@/object-metadata/types/ObjectMetadataItemIdentifier';
import { getRecordsFromRecordConnection } from '@/object-record/cache/utils/getRecordsFromRecordConnection';
import { type RecordGqlConnectionEdgesRequired } from '@/object-record/graphql/types/RecordGqlConnectionEdgesRequired';
import { type RecordGqlOperationFindDuplicatesResult } from '@/object-record/graphql/types/RecordGqlOperationFindDuplicatesResults';
import { useFindDuplicateRecordsQuery } from '@/object-record/hooks/useFindDuplicatesRecordsQuery';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { getFindDuplicateRecordsQueryResponseField } from '@/object-record/utils/getFindDuplicateRecordsQueryResponseField';

export const useFindDuplicateRecords = <T extends ObjectRecord = ObjectRecord>({
  objectRecordIds = [],
  objectNameSingular,
  skip,
}: ObjectMetadataItemIdentifier & {
  objectRecordIds: string[] | undefined;
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
      },
    );

  useSnackBarOnQueryError(error);

  const objectResults = data?.[queryResponseField];

  const results = useMemo(
    () =>
      objectResults?.map((result: RecordGqlConnectionEdgesRequired) => {
        return isDefined(result)
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

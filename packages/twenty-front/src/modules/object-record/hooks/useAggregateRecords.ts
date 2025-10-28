import { useQuery } from '@apollo/client';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { type RecordGqlFieldsAggregate } from '@/object-record/graphql/types/RecordGqlFieldsAggregate';
import { type RecordGqlOperationFindManyResult } from '@/object-record/graphql/types/RecordGqlOperationFindManyResult';
import { useAggregateRecordsQuery } from '@/object-record/hooks/useAggregateRecordsQuery';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { type ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import isEmpty from 'lodash.isempty';
import { type RecordGqlOperationFilter } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export type AggregateRecordsData = {
  [fieldName: string]: {
    [operation in ExtendedAggregateOperations]?: string | number | undefined;
  };
};

export const useAggregateRecords = <T extends AggregateRecordsData>({
  objectNameSingular,
  filter,
  recordGqlFieldsAggregate,
  skip,
}: {
  objectNameSingular: string;
  recordGqlFieldsAggregate: RecordGqlFieldsAggregate;
  filter?: RecordGqlOperationFilter;
  skip?: boolean;
}) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const apolloCoreClient = useApolloCoreClient();

  const { aggregateQuery, gqlFieldToFieldMap } = useAggregateRecordsQuery({
    objectNameSingular,
    recordGqlFieldsAggregate,
  });

  const objectPermissions = useObjectPermissionsForObject(
    objectMetadataItem.id,
  );

  const hasReadPermission = objectPermissions.canReadObjectRecords;

  const { data, loading, error } = useQuery<RecordGqlOperationFindManyResult>(
    aggregateQuery,
    {
      skip: skip || !objectMetadataItem || !hasReadPermission,
      variables: {
        filter,
      },
      client: apolloCoreClient,
    },
  );

  const formattedData: AggregateRecordsData = {};

  if (!isEmpty(data)) {
    Object.entries(data?.[objectMetadataItem.namePlural] ?? {})?.forEach(
      ([gqlField, result]) => {
        if (isDefined(gqlFieldToFieldMap[gqlField])) {
          const [fieldName, aggregateOperation] = gqlFieldToFieldMap[gqlField];
          formattedData[fieldName] = {
            ...(formattedData[fieldName] ?? {}),
            [aggregateOperation]: result,
          };
        }
      },
    );
  }

  return {
    objectMetadataItem,
    data: formattedData as T,
    loading,
    error,
  };
};

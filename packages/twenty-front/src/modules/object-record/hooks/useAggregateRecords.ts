import { useQuery } from '@apollo/client';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { RecordGqlFieldsAggregate } from '@/object-record/graphql/types/RecordGqlFieldsAggregate';
import { RecordGqlOperationFilter } from '@/object-record/graphql/types/RecordGqlOperationFilter';
import { RecordGqlOperationFindManyResult } from '@/object-record/graphql/types/RecordGqlOperationFindManyResult';
import { useAggregateRecordsQuery } from '@/object-record/hooks/useAggregateRecordsQuery';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import isEmpty from 'lodash.isempty';
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

  const { aggregateQuery, gqlFieldToFieldMap } = useAggregateRecordsQuery({
    objectNameSingular,
    recordGqlFieldsAggregate,
  });

  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const hasReadPermission =
    objectPermissionsByObjectMetadataId[objectMetadataItem.id]
      ?.canReadObjectRecords === true;

  const { data, loading, error } = useQuery<RecordGqlOperationFindManyResult>(
    aggregateQuery,
    {
      skip: skip || !objectMetadataItem || !hasReadPermission,
      variables: {
        filter,
      },
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

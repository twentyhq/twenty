import { useQuery } from '@apollo/client';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { RecordGqlFieldsAggregate } from '@/object-record/graphql/types/RecordGqlFieldsAggregate';
import { RecordGqlOperationFilter } from '@/object-record/graphql/types/RecordGqlOperationFilter';
import { RecordGqlOperationFindManyResult } from '@/object-record/graphql/types/RecordGqlOperationFindManyResult';
import { useAggregateQuery } from '@/object-record/hooks/useAggregateQuery';
import { AGGREGATE_OPERATIONS } from '@/object-record/record-table/constants/AggregateOperations';
import isEmpty from 'lodash.isempty';
import { isDefined } from 'twenty-ui';

export type AggregateData = {
  [fieldName: string]: {
    [operation in AGGREGATE_OPERATIONS]?: string | number | undefined;
  };
};

export const useAggregate = ({
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

  const { aggregateQuery, gqlFieldToFieldMap } = useAggregateQuery({
    objectNameSingular,
    recordGqlFieldsAggregate,
  });

  const { data, loading, error } = useQuery<RecordGqlOperationFindManyResult>(
    aggregateQuery,
    {
      skip: skip || !objectMetadataItem,
      variables: {
        filter,
      },
    },
  );

  const formattedData: AggregateData = {};

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
    data: formattedData,
    loading,
    error,
  };
};

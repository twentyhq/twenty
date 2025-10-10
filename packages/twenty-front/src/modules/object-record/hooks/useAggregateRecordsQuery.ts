import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { type RecordGqlFields } from '@/object-record/graphql/record-gql-fields/types/RecordGqlFields';
import { type RecordGqlFieldsAggregate } from '@/object-record/graphql/types/RecordGqlFieldsAggregate';
import { type ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { generateAggregateQuery } from '@/object-record/utils/generateAggregateQuery';
import { getAvailableAggregationsFromObjectFields } from '@/object-record/utils/getAvailableAggregationsFromObjectFields';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

export type GqlFieldToFieldMap = {
  [gqlField: string]: [
    fieldName: string,
    aggregateOperation: ExtendedAggregateOperations,
  ];
};

export const useAggregateRecordsQuery = ({
  objectNameSingular,
  recordGqlFieldsAggregate = {},
}: {
  objectNameSingular: string;
  recordGqlFieldsAggregate: RecordGqlFieldsAggregate;
}) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const apolloCoreClient = useApolloCoreClient();
  const availableAggregations = useMemo(
    () =>
      getAvailableAggregationsFromObjectFields(
        objectMetadataItem.readableFields,
      ),
    [objectMetadataItem.readableFields],
  );

  const recordGqlFields: RecordGqlFields = {};
  const gqlFieldToFieldMap: GqlFieldToFieldMap = {};

  Object.entries(recordGqlFieldsAggregate).forEach(
    ([fieldName, aggregateOperations]) => {
      aggregateOperations.forEach((aggregateOperation) => {
        const fieldToQuery =
          availableAggregations[fieldName]?.[aggregateOperation];

        if (!isDefined(fieldToQuery)) {
          return;
        }
        gqlFieldToFieldMap[fieldToQuery] = [fieldName, aggregateOperation];

        recordGqlFields[fieldToQuery] = true;
      });
    },
    {
      client: apolloCoreClient,
    },
  );

  const aggregateQuery = generateAggregateQuery({
    objectMetadataItem,
    recordGqlFields,
  });

  return {
    aggregateQuery,
    gqlFieldToFieldMap,
  };
};

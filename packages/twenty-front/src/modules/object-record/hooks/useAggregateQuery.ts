import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { RecordGqlFields } from '@/object-record/graphql/types/RecordGqlFields';
import { RecordGqlFieldsAggregate } from '@/object-record/graphql/types/RecordGqlFieldsAggregate';
import { generateAggregateQuery } from '@/object-record/utils/generateAggregateQuery';
import { getAvailableAggregationsFromObjectFields } from '@/object-record/utils/getAvailableAggregationsFromObjectFields';
import { useMemo } from 'react';
import { isDefined } from 'twenty-ui';

export const useAggregateQuery = ({
  objectNameSingular,
  recordGqlFieldsAggregate = {},
}: {
  objectNameSingular: string;
  recordGqlFieldsAggregate: RecordGqlFieldsAggregate;
}) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const availableAggregations = useMemo(
    () => getAvailableAggregationsFromObjectFields(objectMetadataItem.fields),
    [objectMetadataItem.fields],
  );

  const recordGqlFields: RecordGqlFields = {};

  Object.entries(recordGqlFieldsAggregate).forEach(
    ([fieldName, aggregateOperation]) => {
      const fieldToQuery =
        availableAggregations[fieldName]?.[aggregateOperation];

      if (!isDefined(fieldToQuery)) {
        throw new Error(
          `Cannot query operation ${aggregateOperation} on field ${fieldName}`,
        );
      }

      recordGqlFields[fieldToQuery] = true;
    },
  );

  const aggregateQuery = generateAggregateQuery({
    objectMetadataItem,
    recordGqlFields,
  });

  return {
    aggregateQuery,
  };
};

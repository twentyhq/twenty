import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type RecordGqlFieldsAggregate } from '@/object-record/graphql/types/RecordGqlFieldsAggregate';
import { mergeRecordGqlFields } from '@/object-record/graphql/record-gql-fields/utils/mergeRecordGqlFields';
import { type ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { generateAggregateQuery } from '@/object-record/utils/generateAggregateQuery';
import { getAvailableAggregationsFromObjectFields } from '@/object-record/utils/getAvailableAggregationsFromObjectFields';
import {
  buildAggregateFieldPath,
  splitAggregateFieldPath,
} from '@/object-record/utils/splitAggregateFieldPath';
import { useMemo } from 'react';
import { type RecordGqlFields } from 'twenty-shared/types';
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

  const { objectMetadataItems } = useObjectMetadataItems();

  const availableAggregations = useMemo(
    () =>
      getAvailableAggregationsFromObjectFields(
        objectMetadataItem.readableFields,
      ),
    [objectMetadataItem.readableFields],
  );

  const { recordGqlFields, gqlFieldToFieldMap } = useMemo(() => {
    let fields: RecordGqlFields = {};
    const fieldMap: GqlFieldToFieldMap = {};

    Object.entries(recordGqlFieldsAggregate).forEach(
      ([aggregateFieldPath, aggregateOperations]) => {
        const { relationFieldName, fieldName } =
          splitAggregateFieldPath(aggregateFieldPath);

        const targetObjectMetadataItem = isDefined(relationFieldName)
          ? objectMetadataItems.find(
              (objectMetadataItemToFind) =>
                objectMetadataItemToFind.id ===
                objectMetadataItem.fields.find(
                  (field) => field.name === relationFieldName,
                )?.relation?.targetObjectMetadata.id,
            )
          : undefined;

        const aggregationsForPath = isDefined(relationFieldName)
          ? isDefined(targetObjectMetadataItem)
            ? getAvailableAggregationsFromObjectFields(
                targetObjectMetadataItem.readableFields,
              )
            : {}
          : availableAggregations;

        aggregateOperations.forEach((aggregateOperation) => {
          const fieldToQuery =
            aggregationsForPath[fieldName]?.[aggregateOperation];

          if (!isDefined(fieldToQuery)) {
            return;
          }

          if (isDefined(relationFieldName)) {
            fieldMap[
              buildAggregateFieldPath({
                relationFieldName,
                targetFieldName: fieldToQuery,
              })
            ] = [aggregateFieldPath, aggregateOperation];

            fields = mergeRecordGqlFields(fields, {
              [relationFieldName]: { [fieldToQuery]: true },
            });
            return;
          }

          fieldMap[fieldToQuery] = [fieldName, aggregateOperation];

          fields = mergeRecordGqlFields(fields, { [fieldToQuery]: true });
        });
      },
    );

    return { recordGqlFields: fields, gqlFieldToFieldMap: fieldMap };
  }, [
    availableAggregations,
    objectMetadataItem.fields,
    objectMetadataItems,
    recordGqlFieldsAggregate,
  ]);

  const aggregateQuery = useMemo(
    () =>
      generateAggregateQuery({
        objectMetadataItem,
        recordGqlFields,
      }),
    [objectMetadataItem, recordGqlFields],
  );

  return {
    aggregateQuery,
    gqlFieldToFieldMap,
  };
};

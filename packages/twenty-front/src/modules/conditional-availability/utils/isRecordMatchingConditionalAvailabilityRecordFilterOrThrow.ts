import { type ConditionalAvailabilityRecordFilterField } from '@/conditional-availability/types/ConditionalAvailabilityRecordFilterField';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { isManyToOneRelationField } from '@/object-metadata/utils/isManyToOneRelationField';
import { isRecordMatchingFilter } from '@/object-record/record-filter/utils/isRecordMatchingFilter';
import { doNotTranslate } from 'twenty-shared/i18n';
import {
  type ConditionalAvailabilityRecordFilter,
  type RecordFilterValueDependencies,
} from 'twenty-shared/types';
import {
  computeRecordGqlOperationFilter,
  computeRelationGqlFieldJoinColumnName,
  isDefined,
} from 'twenty-shared/utils';

export const isRecordMatchingConditionalAvailabilityRecordFilterOrThrow = ({
  record,
  recordFilter,
  recordFilterFieldByUniversalIdentifier,
  objectMetadataItems,
  filterValueDependencies,
}: {
  record: unknown;
  recordFilter: ConditionalAvailabilityRecordFilter;
  recordFilterFieldByUniversalIdentifier: Map<
    string,
    ConditionalAvailabilityRecordFilterField
  >;
  objectMetadataItems: EnrichedObjectMetadataItem[];
  filterValueDependencies: RecordFilterValueDependencies;
}): boolean => {
  const recordFilterField = recordFilterFieldByUniversalIdentifier.get(
    recordFilter.fieldMetadataUniversalIdentifier,
  );

  if (!isDefined(recordFilterField)) {
    throw new Error(doNotTranslate('The field of the rule does not exist'));
  }

  const { objectMetadataItem, fieldMetadataItem } = recordFilterField;
  const recordPropertyName = isManyToOneRelationField(fieldMetadataItem)
    ? computeRelationGqlFieldJoinColumnName({ name: fieldMetadataItem.name })
    : fieldMetadataItem.name;

  if (Reflect.get(Object(record), recordPropertyName) === undefined) {
    throw new Error(doNotTranslate('The record does not hold the field'));
  }

  const recordGqlOperationFilter = computeRecordGqlOperationFilter({
    fieldMetadataItems: objectMetadataItem.fields,
    recordFilters: [
      {
        fieldMetadataId: fieldMetadataItem.id,
        operand: recordFilter.operand,
        value: recordFilter.value,
        subFieldName: recordFilter.subFieldName,
      },
    ],
    recordFilterGroups: [],
    filterValueDependencies,
  });

  if (Object.keys(recordGqlOperationFilter).length === 0) {
    throw new Error(doNotTranslate('The rule cannot be read as a filter'));
  }

  return isRecordMatchingFilter({
    record,
    filter: recordGqlOperationFilter,
    objectMetadataItem,
    objectMetadataItems,
  });
};

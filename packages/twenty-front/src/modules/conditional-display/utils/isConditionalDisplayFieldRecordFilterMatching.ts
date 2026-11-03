import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { isRecordMatchingFilter } from '@/object-record/record-filter/utils/isRecordMatchingFilter';
import { isValidSubFieldName } from '@/settings/data-model/utils/isValidSubFieldName';
import { type ConditionalDisplayRecordFilter } from 'twenty-shared/types';
import {
  computeRecordGqlOperationFilter,
  isDefined,
} from 'twenty-shared/utils';

type IsConditionalDisplayFieldRecordFilterMatchingParams = {
  recordFilter: ConditionalDisplayRecordFilter;
  record: Record<string, unknown> | undefined;
  objectMetadataItem: EnrichedObjectMetadataItem | undefined;
  objectMetadataItems: EnrichedObjectMetadataItem[];
  currentWorkspaceMemberId: string | null | undefined;
};

export const isConditionalDisplayFieldRecordFilterMatching = ({
  recordFilter,
  record,
  objectMetadataItem,
  objectMetadataItems,
  currentWorkspaceMemberId,
}: IsConditionalDisplayFieldRecordFilterMatchingParams): boolean => {
  if (!isDefined(record) || !isDefined(objectMetadataItem)) {
    return false;
  }

  const { fieldMetadataId, subFieldName } = recordFilter;

  const isActiveFieldOfObject = objectMetadataItem.fields.some(
    (fieldMetadataItem) =>
      fieldMetadataItem.id === fieldMetadataId && fieldMetadataItem.isActive,
  );

  if (!isDefined(fieldMetadataId) || !isActiveFieldOfObject) {
    return false;
  }

  const filter = computeRecordGqlOperationFilter({
    recordFilters: [
      {
        fieldMetadataId,
        operand: recordFilter.operand,
        value: recordFilter.value ?? '',
        subFieldName:
          isDefined(subFieldName) && isValidSubFieldName(subFieldName)
            ? subFieldName
            : null,
        relationTargetFieldMetadataId:
          recordFilter.relationTargetFieldMetadataId,
      },
    ],
    recordFilterGroups: [],
    fieldMetadataItems: objectMetadataItems.flatMap(
      (objectMetadataItemToFlatten) => objectMetadataItemToFlatten.fields,
    ),
    filterValueDependencies: {
      currentWorkspaceMemberId: currentWorkspaceMemberId ?? undefined,
    },
  });

  return isRecordMatchingFilter({
    record,
    filter,
    objectMetadataItem,
    objectMetadataItems,
  });
};

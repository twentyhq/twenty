import { type ConditionalDisplayEvaluationContext } from '@/conditional-display/types/ConditionalDisplayEvaluationContext';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getRecordFilterOperands } from '@/object-record/record-filter/utils/getRecordFilterOperands';
import { isRecordMatchingFilter } from '@/object-record/record-filter/utils/isRecordMatchingFilter';
import {
  type ConditionalDisplayRecordFilter,
  FieldMetadataType,
} from 'twenty-shared/types';
import {
  computeRecordGqlOperationFilter,
  getConditionalDisplayContextVirtualField,
  getFilterTypeFromFieldType,
  isConditionalDisplayContextKey,
  isDefined,
  isEmptyObject,
  safeGetNestedProperty,
} from 'twenty-shared/utils';

type IsConditionalDisplayContextRecordFilterMatchingParams = {
  recordFilter: ConditionalDisplayRecordFilter;
  context: ConditionalDisplayEvaluationContext;
  objectMetadataItems: EnrichedObjectMetadataItem[];
};

export const isConditionalDisplayContextRecordFilterMatching = ({
  recordFilter,
  context,
  objectMetadataItems,
}: IsConditionalDisplayContextRecordFilterMatchingParams): boolean => {
  const { contextKey, subFieldName } = recordFilter;

  if (!isDefined(contextKey) || !isConditionalDisplayContextKey(contextKey)) {
    return false;
  }

  const contextValue = context[contextKey];

  const virtualField = getConditionalDisplayContextVirtualField({
    contextKey,
    subFieldName,
  });

  if (!isDefined(contextValue) || !isDefined(virtualField)) {
    return false;
  }

  const allowedOperands = getRecordFilterOperands({
    filterType: getFilterTypeFromFieldType(virtualField.type),
  });

  if (!allowedOperands.includes(recordFilter.operand)) {
    return false;
  }

  const fieldName = subFieldName ?? contextKey;

  const subjectValue = isDefined(subFieldName)
    ? safeGetNestedProperty(contextValue, subFieldName)
    : contextValue;

  const selectOptionValues =
    virtualField.options ??
    objectMetadataItems.map(({ nameSingular }) => nameSingular);

  const virtualFieldMetadataItem = {
    id: fieldName,
    name: fieldName,
    label: fieldName,
    type: virtualField.type,
    options:
      virtualField.type === FieldMetadataType.SELECT
        ? selectOptionValues.map((value, position) => ({ value, position }))
        : null,
  };

  const filter = computeRecordGqlOperationFilter({
    recordFilters: [
      {
        fieldMetadataId: virtualFieldMetadataItem.id,
        operand: recordFilter.operand,
        value: recordFilter.value ?? '',
      },
    ],
    recordFilterGroups: [],
    fieldMetadataItems: [virtualFieldMetadataItem],
    filterValueDependencies: {
      currentWorkspaceMemberId: context.currentWorkspaceMemberId ?? undefined,
    },
  });

  if (isEmptyObject(filter)) {
    return false;
  }

  return isRecordMatchingFilter({
    record: {
      [fieldName]:
        virtualField.type === FieldMetadataType.BOOLEAN
          ? subjectValue === true
          : (subjectValue ?? null),
    },
    filter,
    objectMetadataItem: {
      nameSingular: contextKey,
      fields: [virtualFieldMetadataItem],
    },
    objectMetadataItems,
  });
};

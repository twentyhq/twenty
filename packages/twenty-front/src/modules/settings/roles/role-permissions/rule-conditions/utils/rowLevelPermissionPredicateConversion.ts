/* @license Enterprise */

import {
  RecordFilterGroupLogicalOperator,
  ViewFilterOperand,
} from 'twenty-shared/types';
import { getFilterTypeFromFieldType, isDefined } from 'twenty-shared/utils';

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { type CompositeFieldSubFieldName } from '@/settings/data-model/types/CompositeFieldSubFieldName';
import {
  type RowLevelPermissionPredicate,
  type RowLevelPermissionPredicateGroup,
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
} from '~/generated-metadata/graphql';

const PREDICATE_OPERAND_TO_VIEW_FILTER_OPERAND: Record<
  RowLevelPermissionPredicateOperand,
  ViewFilterOperand
> = {
  [RowLevelPermissionPredicateOperand.CONTAINS]: ViewFilterOperand.CONTAINS,
  [RowLevelPermissionPredicateOperand.DOES_NOT_CONTAIN]:
    ViewFilterOperand.DOES_NOT_CONTAIN,
  [RowLevelPermissionPredicateOperand.GREATER_THAN_OR_EQUAL]:
    ViewFilterOperand.GREATER_THAN_OR_EQUAL,
  [RowLevelPermissionPredicateOperand.IS]: ViewFilterOperand.IS,
  [RowLevelPermissionPredicateOperand.IS_AFTER]: ViewFilterOperand.IS_AFTER,
  [RowLevelPermissionPredicateOperand.IS_BEFORE]: ViewFilterOperand.IS_BEFORE,
  [RowLevelPermissionPredicateOperand.IS_EMPTY]: ViewFilterOperand.IS_EMPTY,
  [RowLevelPermissionPredicateOperand.IS_IN_FUTURE]:
    ViewFilterOperand.IS_IN_FUTURE,
  [RowLevelPermissionPredicateOperand.IS_IN_PAST]: ViewFilterOperand.IS_IN_PAST,
  [RowLevelPermissionPredicateOperand.IS_NOT]: ViewFilterOperand.IS_NOT,
  [RowLevelPermissionPredicateOperand.IS_NOT_EMPTY]:
    ViewFilterOperand.IS_NOT_EMPTY,
  [RowLevelPermissionPredicateOperand.IS_NOT_NULL]:
    ViewFilterOperand.IS_NOT_NULL,
  [RowLevelPermissionPredicateOperand.IS_RELATIVE]:
    ViewFilterOperand.IS_RELATIVE,
  [RowLevelPermissionPredicateOperand.IS_TODAY]: ViewFilterOperand.IS_TODAY,
  [RowLevelPermissionPredicateOperand.LESS_THAN_OR_EQUAL]:
    ViewFilterOperand.LESS_THAN_OR_EQUAL,
  [RowLevelPermissionPredicateOperand.VECTOR_SEARCH]:
    ViewFilterOperand.VECTOR_SEARCH,
};

const VIEW_FILTER_OPERAND_TO_PREDICATE_OPERAND: Record<
  ViewFilterOperand,
  RowLevelPermissionPredicateOperand
> = {
  [ViewFilterOperand.CONTAINS]: RowLevelPermissionPredicateOperand.CONTAINS,
  [ViewFilterOperand.DOES_NOT_CONTAIN]:
    RowLevelPermissionPredicateOperand.DOES_NOT_CONTAIN,
  [ViewFilterOperand.GREATER_THAN_OR_EQUAL]:
    RowLevelPermissionPredicateOperand.GREATER_THAN_OR_EQUAL,
  [ViewFilterOperand.IS]: RowLevelPermissionPredicateOperand.IS,
  [ViewFilterOperand.IS_AFTER]: RowLevelPermissionPredicateOperand.IS_AFTER,
  [ViewFilterOperand.IS_BEFORE]: RowLevelPermissionPredicateOperand.IS_BEFORE,
  [ViewFilterOperand.IS_EMPTY]: RowLevelPermissionPredicateOperand.IS_EMPTY,
  [ViewFilterOperand.IS_IN_FUTURE]:
    RowLevelPermissionPredicateOperand.IS_IN_FUTURE,
  [ViewFilterOperand.IS_IN_PAST]: RowLevelPermissionPredicateOperand.IS_IN_PAST,
  [ViewFilterOperand.IS_NOT]: RowLevelPermissionPredicateOperand.IS_NOT,
  [ViewFilterOperand.IS_NOT_EMPTY]:
    RowLevelPermissionPredicateOperand.IS_NOT_EMPTY,
  [ViewFilterOperand.IS_NOT_NULL]:
    RowLevelPermissionPredicateOperand.IS_NOT_NULL,
  [ViewFilterOperand.IS_RELATIVE]:
    RowLevelPermissionPredicateOperand.IS_RELATIVE,
  [ViewFilterOperand.IS_TODAY]: RowLevelPermissionPredicateOperand.IS_TODAY,
  [ViewFilterOperand.LESS_THAN_OR_EQUAL]:
    RowLevelPermissionPredicateOperand.LESS_THAN_OR_EQUAL,
  [ViewFilterOperand.VECTOR_SEARCH]:
    RowLevelPermissionPredicateOperand.VECTOR_SEARCH,
};

export const convertPredicateToRecordFilter = (
  predicate: RowLevelPermissionPredicate,
  fieldMetadataItem: FieldMetadataItem | undefined,
): RecordFilter | null => {
  if (!isDefined(fieldMetadataItem)) {
    return null;
  }

  const filterType = getFilterTypeFromFieldType(fieldMetadataItem.type);

  const valueString =
    typeof predicate.value === 'string'
      ? predicate.value
      : isDefined(predicate.value)
        ? JSON.stringify(predicate.value)
        : '';

  return {
    id: predicate.id,
    fieldMetadataId: predicate.fieldMetadataId,
    value: valueString,
    displayValue: valueString,
    type: filterType,
    operand: PREDICATE_OPERAND_TO_VIEW_FILTER_OPERAND[predicate.operand],
    label: fieldMetadataItem.label,
    subFieldName: predicate.subFieldName as
      | CompositeFieldSubFieldName
      | null
      | undefined,
    recordFilterGroupId:
      predicate.rowLevelPermissionPredicateGroupId ?? undefined,
    positionInRecordFilterGroup:
      predicate.positionInRowLevelPermissionPredicateGroup,
    rlsDynamicValue: isDefined(predicate.workspaceMemberFieldMetadataId)
      ? {
          workspaceMemberFieldMetadataId:
            predicate.workspaceMemberFieldMetadataId,
          workspaceMemberSubFieldName:
            predicate.workspaceMemberSubFieldName ?? null,
        }
      : null,
  };
};

export const convertRecordFilterToPredicate = (
  filter: RecordFilter,
  roleId: string,
  objectMetadataId: string,
): RowLevelPermissionPredicate => {
  if (isDefined(filter.rlsDynamicValue)) {
    return {
      __typename: 'RowLevelPermissionPredicate',
      id: filter.id,
      fieldMetadataId: filter.fieldMetadataId,
      relationFieldMetadataId: null,
      objectMetadataId,
      operand: VIEW_FILTER_OPERAND_TO_PREDICATE_OPERAND[filter.operand],
      value: null,
      subFieldName: filter.subFieldName ?? null,
      rowLevelPermissionPredicateGroupId: filter.recordFilterGroupId ?? null,
      positionInRowLevelPermissionPredicateGroup:
        filter.positionInRecordFilterGroup ?? null,
      roleId,
      workspaceMemberFieldMetadataId:
        filter.rlsDynamicValue.workspaceMemberFieldMetadataId,
      workspaceMemberSubFieldName:
        filter.rlsDynamicValue.workspaceMemberSubFieldName ?? null,
    };
  }

  return {
    __typename: 'RowLevelPermissionPredicate',
    id: filter.id,
    fieldMetadataId: filter.fieldMetadataId,
    relationFieldMetadataId: null,
    objectMetadataId,
    operand: VIEW_FILTER_OPERAND_TO_PREDICATE_OPERAND[filter.operand],
    value: filter.value || null,
    subFieldName: filter.subFieldName ?? null,
    rowLevelPermissionPredicateGroupId: filter.recordFilterGroupId ?? null,
    positionInRowLevelPermissionPredicateGroup:
      filter.positionInRecordFilterGroup ?? null,
    roleId,
    workspaceMemberFieldMetadataId: null,
    workspaceMemberSubFieldName: null,
  };
};

export const convertPredicateGroupToRecordFilterGroup = (
  predicateGroup: RowLevelPermissionPredicateGroup,
): RecordFilterGroup => {
  return {
    id: predicateGroup.id,
    parentRecordFilterGroupId:
      predicateGroup.parentRowLevelPermissionPredicateGroupId ?? null,
    logicalOperator:
      predicateGroup.logicalOperator ===
      RowLevelPermissionPredicateGroupLogicalOperator.AND
        ? RecordFilterGroupLogicalOperator.AND
        : RecordFilterGroupLogicalOperator.OR,
    positionInRecordFilterGroup:
      predicateGroup.positionInRowLevelPermissionPredicateGroup ?? null,
  };
};

export const convertRecordFilterGroupToPredicateGroup = ({
  filterGroup,
  roleId,
  objectMetadataId,
  existingPredicateGroup,
}: {
  filterGroup: RecordFilterGroup;
  roleId: string;
  objectMetadataId: string;
  existingPredicateGroup?: Pick<
    RowLevelPermissionPredicateGroup,
    | 'canReadRecords'
    | 'canUpdateRecords'
    | 'canSoftDeleteRecords'
    | 'canDestroyRecords'
    | 'rowLevelPermissionRuleId'
  >;
}): RowLevelPermissionPredicateGroup => {
  return {
    __typename: 'RowLevelPermissionPredicateGroup',
    id: filterGroup.id,
    parentRowLevelPermissionPredicateGroupId:
      filterGroup.parentRecordFilterGroupId ?? null,
    logicalOperator:
      filterGroup.logicalOperator === RecordFilterGroupLogicalOperator.AND
        ? RowLevelPermissionPredicateGroupLogicalOperator.AND
        : RowLevelPermissionPredicateGroupLogicalOperator.OR,
    positionInRowLevelPermissionPredicateGroup:
      filterGroup.positionInRecordFilterGroup ?? null,
    canReadRecords: existingPredicateGroup?.canReadRecords ?? false,
    canUpdateRecords: existingPredicateGroup?.canUpdateRecords ?? false,
    canSoftDeleteRecords: existingPredicateGroup?.canSoftDeleteRecords ?? false,
    canDestroyRecords: existingPredicateGroup?.canDestroyRecords ?? false,
    rowLevelPermissionRuleId:
      existingPredicateGroup?.rowLevelPermissionRuleId ?? null,
    roleId,
    objectMetadataId,
  };
};

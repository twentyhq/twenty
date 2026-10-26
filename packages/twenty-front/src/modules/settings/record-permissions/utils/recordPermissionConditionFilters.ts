import { t } from '@lingui/core/macro';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import {
  RecordFilterGroupLogicalOperator,
  type RecordPermissionCondition,
  type RowLevelPermissionPredicateOperand,
  type ViewFilterOperand,
} from 'twenty-shared/types';
import {
  convertViewFilterValueToString,
  getFilterTypeFromFieldType,
  isDefined,
} from 'twenty-shared/utils';
import { v5 } from 'uuid';

export const recordPermissionConditionToFilters = (
  condition: RecordPermissionCondition,
  ruleId: string,
  object: EnrichedObjectMetadataItem,
  memberObject: EnrichedObjectMetadataItem | undefined,
) => {
  const filters: RecordFilter[] = [];
  const groups: RecordFilterGroup[] = [];
  const visit = (
    node: RecordPermissionCondition,
    path: string,
    parentId?: string,
    position = 0,
  ): void => {
    const id = v5(path, ruleId);
    if (node.kind === 'predicate') {
      const field = object.fields.find(
        (field) => field.universalIdentifier === node.fieldUniversalIdentifier,
      );
      if (!field)
        throw new Error(
          t`A field used by this rule no longer exists. Remove or replace the rule.`,
        );
      const memberField = memberObject?.fields.find(
        (field) =>
          field.universalIdentifier === node.memberFieldUniversalIdentifier,
      );
      if (node.memberFieldUniversalIdentifier && !memberField)
        throw new Error(
          t`A workspace member field used by this rule no longer exists.`,
        );
      filters.push({
        id,
        fieldMetadataId: field.id,
        type: getFilterTypeFromFieldType(field.type),
        label: field.label,
        operand: node.operand as unknown as ViewFilterOperand,
        value: convertViewFilterValueToString(node.value),
        displayValue: convertViewFilterValueToString(node.value),
        subFieldName: node.subFieldName as RecordFilter['subFieldName'],
        recordFilterGroupId: parentId,
        positionInRecordFilterGroup: position,
        rlsDynamicValue: memberField
          ? {
              workspaceMemberFieldMetadataId: memberField.id,
              workspaceMemberSubFieldName: node.memberSubFieldName ?? null,
            }
          : null,
      });
    } else {
      groups.push({
        id,
        parentRecordFilterGroupId: parentId,
        logicalOperator:
          node.kind === 'any'
            ? RecordFilterGroupLogicalOperator.OR
            : RecordFilterGroupLogicalOperator.AND,
        positionInRecordFilterGroup: position,
      });
      node.conditions.forEach((child, index) =>
        visit(child, `${path}.${index}`, id, index),
      );
    }
  };
  visit(
    condition.kind === 'predicate'
      ? { kind: 'all', conditions: [condition] }
      : condition,
    'root',
  );
  return { filters, groups };
};

export const recordPermissionFiltersToCondition = (
  filters: RecordFilter[],
  groups: RecordFilterGroup[],
  object: EnrichedObjectMetadataItem,
  memberObject: EnrichedObjectMetadataItem | undefined,
): RecordPermissionCondition => {
  const visit = (group: RecordFilterGroup): RecordPermissionCondition => ({
    kind:
      group.logicalOperator === RecordFilterGroupLogicalOperator.OR
        ? 'any'
        : 'all',
    conditions: [
      ...filters
        .filter((filter) => filter.recordFilterGroupId === group.id)
        .flatMap((filter): RecordPermissionCondition[] => {
          const field = object.fields.find(
            (field) => field.id === filter.fieldMetadataId,
          );
          if (!field)
            throw new Error(
              t`A field used by this rule no longer exists. Remove or replace the rule.`,
            );
          const memberField = memberObject?.fields.find(
            (field) =>
              field.id ===
              filter.rlsDynamicValue?.workspaceMemberFieldMetadataId,
          );
          if (filter.rlsDynamicValue && !memberField)
            throw new Error(
              t`A workspace member field used by this rule no longer exists.`,
            );
          return [
            {
              kind: 'predicate',
              fieldUniversalIdentifier: field.universalIdentifier,
              operand:
                filter.operand as unknown as RowLevelPermissionPredicateOperand,
              value: filter.value,
              subFieldName: filter.subFieldName ?? null,
              memberFieldUniversalIdentifier:
                memberField?.universalIdentifier ?? null,
              memberSubFieldName:
                filter.rlsDynamicValue?.workspaceMemberSubFieldName ?? null,
            },
          ];
        }),
      ...groups
        .filter((child) => child.parentRecordFilterGroupId === group.id)
        .map(visit),
    ],
  });
  const root = groups.find(
    (group) => !isDefined(group.parentRecordFilterGroupId),
  );
  return root ? visit(root) : { kind: 'all', conditions: [] };
};

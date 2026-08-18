/* @license Enterprise */

import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { useMemo } from 'react';
import {
  type RowLevelPermissionPredicate,
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type SelectOption } from 'twenty-ui/input';

// Predicate values for select fields can be:
// - an actual array: ["BIRD", "DOG"]
// - a JSON-stringified array: "[\"BIRD\",\"DOG\"]"
// - a plain string: "BIRD"
const parsePredicateValueAsStringArray = (
  value: RowLevelPermissionPredicate['value'],
): string[] | null => {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string');
  }

  if (typeof value === 'string') {
    if (value.startsWith('[')) {
      try {
        const parsed: unknown = JSON.parse(value);

        if (
          Array.isArray(parsed) &&
          parsed.every((item) => typeof item === 'string')
        ) {
          return parsed;
        }
      } catch {
        // not valid JSON, treat as single value
      }
    }

    return [value];
  }

  return null;
};

const extractAllowedValuesFromPredicate = (
  predicate: RowLevelPermissionPredicate,
): { type: 'include' | 'exclude'; values: string[] } | null => {
  const { operand, value } = predicate;
  const values = parsePredicateValueAsStringArray(value);

  if (!isDefined(values)) {
    return null;
  }

  switch (operand) {
    case RowLevelPermissionPredicateOperand.IS:
    case RowLevelPermissionPredicateOperand.CONTAINS:
      return { type: 'include', values };
    case RowLevelPermissionPredicateOperand.IS_NOT:
    case RowLevelPermissionPredicateOperand.DOES_NOT_CONTAIN:
      return { type: 'exclude', values };
    default:
      return null;
  }
};

const filterOptionsByPredicates = (
  options: SelectOption[],
  predicates: RowLevelPermissionPredicate[],
): SelectOption[] => {
  if (predicates.length === 0) {
    return options;
  }

  let filteredOptions = options;

  for (const predicate of predicates) {
    const result = extractAllowedValuesFromPredicate(predicate);

    if (!isDefined(result)) {
      continue;
    }

    if (result.type === 'include') {
      filteredOptions = filteredOptions.filter((option) =>
        result.values.includes(option.value),
      );
    } else {
      filteredOptions = filteredOptions.filter(
        (option) => !result.values.includes(option.value),
      );
    }
  }

  return filteredOptions;
};

export const useFilteredSelectOptionsFromRLSPredicates = ({
  fieldMetadataId,
  objectMetadataNameSingular,
  options,
}: {
  fieldMetadataId: string;
  objectMetadataNameSingular: string | undefined;
  options: SelectOption[];
}): { filteredOptions: SelectOption[]; canSelectEmpty: boolean } => {
  const { objectMetadataItems } = useObjectMetadataItems();

  const objectMetadataId = objectMetadataNameSingular
    ? objectMetadataItems.find(
        (item) => item.nameSingular === objectMetadataNameSingular,
      )?.id
    : undefined;

  const objectPermissions = useObjectPermissionsForObject(
    objectMetadataId ?? '',
  );

  return useMemo(() => {
    if (!isDefined(objectMetadataId)) {
      return { filteredOptions: options, canSelectEmpty: true };
    }

    const selectPredicates =
      objectPermissions.rowLevelPermissionPredicates.filter(
        (predicate) => predicate.fieldMetadataId === fieldMetadataId,
      );

    if (selectPredicates.length === 0) {
      return { filteredOptions: options, canSelectEmpty: true };
    }

    const predicateGroups = objectPermissions.rowLevelPermissionPredicateGroups;

    const predicateGroupById = new Map(
      predicateGroups.map((group) => [group.id, group]),
    );

    const isPredicateInsideOrGroup = (
      predicate: RowLevelPermissionPredicate,
    ): boolean => {
      let groupId = predicate.rowLevelPermissionPredicateGroupId;
      const visitedGroupIds = new Set<string>();

      while (isDefined(groupId) && !visitedGroupIds.has(groupId)) {
        visitedGroupIds.add(groupId);

        const group = predicateGroupById.get(groupId);

        if (!isDefined(group)) {
          break;
        }

        if (
          group.logicalOperator ===
          RowLevelPermissionPredicateGroupLogicalOperator.OR
        ) {
          return true;
        }

        groupId = group.parentRowLevelPermissionPredicateGroupId;
      }

      return false;
    };

    const predicatesOutsideOrGroups = selectPredicates.filter(
      (predicate) => !isPredicateInsideOrGroup(predicate),
    );

    const hasIsEmptyPredicate = predicatesOutsideOrGroups.some(
      (predicate) =>
        predicate.operand === RowLevelPermissionPredicateOperand.IS_EMPTY,
    );

    const hasIsNotEmptyPredicate = predicatesOutsideOrGroups.some(
      (predicate) =>
        predicate.operand === RowLevelPermissionPredicateOperand.IS_NOT_EMPTY,
    );

    return {
      filteredOptions: filterOptionsByPredicates(
        options,
        predicatesOutsideOrGroups,
      ),
      canSelectEmpty: hasIsEmptyPredicate && !hasIsNotEmptyPredicate,
    };
  }, [
    objectMetadataId,
    objectPermissions.rowLevelPermissionPredicates,
    objectPermissions.rowLevelPermissionPredicateGroups,
    fieldMetadataId,
    options,
  ]);
};

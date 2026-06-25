import { createValidationResult } from '@/sdk/define/common/utils/create-validation-result';
import { type DefineEntity } from '@/sdk/define/common/types/define-entity.type';
import { type RoleConfig } from '@/sdk/define/roles/role-config';

export const defineRole: DefineEntity<RoleConfig> = (config) => {
  const errors = [];

  if (!config.universalIdentifier) {
    errors.push('Role must have a universalIdentifier');
  }

  if (!config.label) {
    errors.push('Role must have a label');
  }

  if (config.objectPermissions) {
    for (const permission of config.objectPermissions) {
      if (!permission.objectUniversalIdentifier) {
        errors.push('Object permission must have an objectUniversalIdentifier');
      }
    }
  }

  if (config.fieldPermissions) {
    for (const permission of config.fieldPermissions) {
      if (!permission.objectUniversalIdentifier) {
        errors.push('Field permission must have an objectUniversalIdentifier');
      }

      if (!permission.fieldUniversalIdentifier) {
        errors.push('Field permission must have a fieldUniversalIdentifier');
      }
    }
  }

  const predicateGroupUniversalIdentifiers = new Set<string>();

  if (config.rowLevelPermissionPredicateGroups) {
    for (const group of config.rowLevelPermissionPredicateGroups) {
      if (!group.universalIdentifier) {
        errors.push(
          'Row level permission predicate group must have a universalIdentifier',
        );
      } else if (
        predicateGroupUniversalIdentifiers.has(group.universalIdentifier)
      ) {
        errors.push(
          `Duplicate row level permission predicate group universalIdentifier "${group.universalIdentifier}"`,
        );
      } else {
        predicateGroupUniversalIdentifiers.add(group.universalIdentifier);
      }

      if (!group.objectUniversalIdentifier) {
        errors.push(
          'Row level permission predicate group must have an objectUniversalIdentifier',
        );
      }

      if (!group.logicalOperator) {
        errors.push(
          'Row level permission predicate group must have a logicalOperator',
        );
      }
    }
  }

  const predicateUniversalIdentifiers = new Set<string>();

  if (config.rowLevelPermissionPredicates) {
    for (const predicate of config.rowLevelPermissionPredicates) {
      if (!predicate.universalIdentifier) {
        errors.push(
          'Row level permission predicate must have a universalIdentifier',
        );
      } else if (
        predicateUniversalIdentifiers.has(predicate.universalIdentifier)
      ) {
        errors.push(
          `Duplicate row level permission predicate universalIdentifier "${predicate.universalIdentifier}"`,
        );
      } else {
        predicateUniversalIdentifiers.add(predicate.universalIdentifier);
      }

      if (!predicate.objectUniversalIdentifier) {
        errors.push(
          'Row level permission predicate must have an objectUniversalIdentifier',
        );
      }

      if (!predicate.fieldUniversalIdentifier) {
        errors.push(
          'Row level permission predicate must have a fieldUniversalIdentifier',
        );
      }

      if (!predicate.operand) {
        errors.push('Row level permission predicate must have an operand');
      }

      if (
        predicate.predicateGroupUniversalIdentifier &&
        !predicateGroupUniversalIdentifiers.has(
          predicate.predicateGroupUniversalIdentifier,
        )
      ) {
        errors.push(
          `Row level permission predicate references unknown predicate group "${predicate.predicateGroupUniversalIdentifier}"`,
        );
      }
    }
  }

  return createValidationResult({ config, errors });
};

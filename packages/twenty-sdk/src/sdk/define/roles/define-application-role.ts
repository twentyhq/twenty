import { isNonEmptyArray } from 'twenty-shared/utils';

import { createValidationResult } from '@/sdk/define/common/utils/create-validation-result';
import { type DefineEntity } from '@/sdk/define/common/types/define-entity.type';
import { defineRole } from '@/sdk/define/roles/define-role';
import { type RoleConfig } from '@/sdk/define/roles/role-config';

// The application role is a request, and grants carry no field permissions or row-level rules in v1
export const defineApplicationRole: DefineEntity<RoleConfig> = (config) => {
  const result = defineRole(config);

  const hasRowLevelRules =
    isNonEmptyArray(config.rowLevelPermissionPredicates) ||
    isNonEmptyArray(config.rowLevelPermissionPredicateGroups);
  const hasFieldPermissions = isNonEmptyArray(config.fieldPermissions);

  if (!hasRowLevelRules && !hasFieldPermissions) {
    return result;
  }

  return createValidationResult({
    config: result.config,
    errors: [
      ...result.errors,
      ...(hasRowLevelRules
        ? [
            'Application roles cannot declare row-level permission rules: the granted role carries none',
          ]
        : []),
      ...(hasFieldPermissions
        ? [
            'Application roles cannot declare field permissions: the granted role carries none',
          ]
        : []),
    ],
    warnings: result.warnings,
  });
};

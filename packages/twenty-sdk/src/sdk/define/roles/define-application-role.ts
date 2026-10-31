import { isNonEmptyArray } from 'twenty-shared/utils';

import { createValidationResult } from '@/sdk/define/common/utils/create-validation-result';
import { type DefineEntity } from '@/sdk/define/common/types/define-entity.type';
import { defineRole } from '@/sdk/define/roles/define-role';
import { type RoleConfig } from '@/sdk/define/roles/role-config';

// The application role is a request: row-level rules on the granted role come only from the workspace admin
export const defineApplicationRole: DefineEntity<RoleConfig> = (config) => {
  const result = defineRole(config);

  const hasRowLevelRules =
    isNonEmptyArray(config.rowLevelPermissionPredicates) ||
    isNonEmptyArray(config.rowLevelPermissionPredicateGroups);

  if (!hasRowLevelRules) {
    return result;
  }

  return createValidationResult({
    config: result.config,
    errors: [
      ...result.errors,
      'Application roles cannot declare row-level permission rules: workspace admins add them on the granted role',
    ],
    warnings: result.warnings,
  });
};

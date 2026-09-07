import {
  RecordSharePrincipalType,
  SharingRuleAccessLevel,
} from 'twenty-shared/types';

import { type DefineEntity } from '@/sdk/define/common/types/define-entity.type';
import { createValidationResult } from '@/sdk/define/common/utils/create-validation-result';
import { type SharingRuleConfig } from '@/sdk/define/sharing-rules/sharing-rule-config';

export const defineSharingRule: DefineEntity<SharingRuleConfig> = (config) => {
  const errors: string[] = [];

  if (!config.universalIdentifier) {
    errors.push('SharingRule must have a universalIdentifier');
  }

  if (!config.name) {
    errors.push('SharingRule must have a name');
  }

  if (!config.objectUniversalIdentifier) {
    errors.push('SharingRule must have an objectUniversalIdentifier');
  }

  if (!Object.values(SharingRuleAccessLevel).includes(config.accessLevel)) {
    errors.push('SharingRule accessLevel must be READ or READ_WRITE');
  }

  switch (config.granteePrincipalType) {
    case RecordSharePrincipalType.EVERYONE: {
      if (config.granteeRoleUniversalIdentifier) {
        errors.push('SharingRule granting everyone must not name a role');
      }
      break;
    }
    case RecordSharePrincipalType.ROLE: {
      if (!config.granteeRoleUniversalIdentifier) {
        errors.push(
          'SharingRule granting a role must have a granteeRoleUniversalIdentifier',
        );
      }
      break;
    }
    default: {
      errors.push(
        `SharingRule granteePrincipalType ${config.granteePrincipalType} is not supported in a manifest: a workspace member id has no meaning outside the workspace it was copied from, grant everyone or a role`,
      );
    }
  }

  const predicateGroupUniversalIdentifiers = new Set(
    (config.rowLevelPermissionPredicateGroups ?? []).map(
      (group) => group.universalIdentifier,
    ),
  );

  for (const predicate of config.rowLevelPermissionPredicates ?? []) {
    if (!predicate.universalIdentifier) {
      errors.push(
        'Row level permission predicate must have a universalIdentifier',
      );
    }

    if (!predicate.fieldUniversalIdentifier) {
      errors.push(
        'Row level permission predicate must have a fieldUniversalIdentifier',
      );
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

  return createValidationResult({ config, errors });
};

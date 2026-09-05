import {
  RecordShareAccessLevel,
  RecordSharePrincipalType,
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

  if (
    config.accessLevel !== RecordShareAccessLevel.READ &&
    config.accessLevel !== RecordShareAccessLevel.READ_WRITE
  ) {
    errors.push('SharingRule accessLevel must be READ or READ_WRITE');
  }

  switch (config.granteePrincipalType) {
    case RecordSharePrincipalType.EVERYONE: {
      if (config.granteeRoleUniversalIdentifier || config.granteePrincipalId) {
        errors.push('SharingRule granting everyone must not name a grantee');
      }
      break;
    }
    case RecordSharePrincipalType.ROLE: {
      if (!config.granteeRoleUniversalIdentifier || config.granteePrincipalId) {
        errors.push(
          'SharingRule granting a role must have a granteeRoleUniversalIdentifier and no granteePrincipalId',
        );
      }
      break;
    }
    case RecordSharePrincipalType.WORKSPACE_MEMBER: {
      if (!config.granteePrincipalId || config.granteeRoleUniversalIdentifier) {
        errors.push(
          'SharingRule granting a workspace member must have a granteePrincipalId and no granteeRoleUniversalIdentifier',
        );
      }
      break;
    }
    default: {
      errors.push(
        `SharingRule granteePrincipalType ${config.granteePrincipalType} is not supported`,
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

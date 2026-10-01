/* @license Enterprise */

import { isNonEmptyArray } from 'twenty-shared/utils';

import { buildRecordShareCondition } from 'src/engine/core-modules/record-share/utils/build-record-share-condition.util';
import { resolveNamedPrincipalIds } from 'src/engine/core-modules/record-share/utils/resolve-named-principal-ids.util';
import { resolveRequiredRecordShareAccessLevels } from 'src/engine/core-modules/record-share/utils/resolve-required-record-share-access-levels.util';
import {
  type RowAccessPolicyContext,
  type RowAccessPolicyTarget,
  type SqlCondition,
} from 'src/engine/twenty-orm/types/row-access-policy.type';

export const buildNamedRecordGrantCondition = (
  { subject, environment }: RowAccessPolicyContext,
  { tableAlias, flatObjectMetadata, operationType }: RowAccessPolicyTarget,
): SqlCondition | undefined => {
  const principalIds = resolveNamedPrincipalIds(subject);
  const accessLevels = resolveRequiredRecordShareAccessLevels(operationType);

  if (!isNonEmptyArray(principalIds) || !isNonEmptyArray(accessLevels)) {
    return undefined;
  }

  return buildRecordShareCondition({
    tableAlias,
    recordShareTableExpression: environment.recordShareTableExpression,
    objectMetadataId: flatObjectMetadata.id,
    principalIds,
    accessLevels,
    isUncorrelated: true,
  });
};

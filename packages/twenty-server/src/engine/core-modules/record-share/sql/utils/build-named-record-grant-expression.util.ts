/* @license Enterprise */

import { isNonEmptyArray } from 'twenty-shared/utils';

import { resolveNamedPrincipalIds } from 'src/engine/core-modules/record-share/utils/resolve-named-principal-ids.util';
import { resolveRequiredRecordShareAccessLevels } from 'src/engine/core-modules/record-share/utils/resolve-required-record-share-access-levels.util';
import {
  type RowAccessExpression,
  type RowAccessPolicyContext,
  type RowAccessPolicyTarget,
} from 'src/engine/twenty-orm/types/row-access-policy.type';

export const buildNamedRecordGrantExpression = (
  { subject }: Pick<RowAccessPolicyContext, 'subject'>,
  { tableAlias, flatObjectMetadata, operationType }: RowAccessPolicyTarget,
): RowAccessExpression | undefined => {
  const principalIds = resolveNamedPrincipalIds(subject);
  const accessLevels = resolveRequiredRecordShareAccessLevels(operationType);

  if (!isNonEmptyArray(principalIds) || !isNonEmptyArray(accessLevels)) {
    return undefined;
  }

  return {
    kind: 'recordShared',
    isUncorrelated: true,
    tableAlias,
    objectMetadataId: flatObjectMetadata.id,
    principalIds,
    accessLevels,
  };
};

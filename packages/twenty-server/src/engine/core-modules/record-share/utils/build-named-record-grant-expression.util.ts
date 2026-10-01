/* @license Enterprise */

import { EVERYONE_PRINCIPAL_ID } from 'twenty-shared/constants';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { resolveRequiredRecordShareAccessLevels } from 'src/engine/core-modules/record-share/utils/resolve-required-record-share-access-levels.util';
import {
  type RowAccessExpression,
  type RowAccessPolicyContext,
  type RowAccessPolicyTarget,
} from 'src/engine/twenty-orm/types/row-access-policy.type';

// Only a grant naming the member or one of their roles reaches beyond the
// role: general access goes as far as the people who can access the object
export const buildNamedRecordGrantExpression = (
  { subject }: Pick<RowAccessPolicyContext, 'subject'>,
  { tableAlias, flatObjectMetadata, operationType }: RowAccessPolicyTarget,
): RowAccessExpression | undefined => {
  const principalIds = (subject.principalIds ?? []).filter(
    (principalId) => principalId !== EVERYONE_PRINCIPAL_ID,
  );
  const accessLevels = resolveRequiredRecordShareAccessLevels(operationType);

  if (!isNonEmptyArray(principalIds) || !isNonEmptyArray(accessLevels)) {
    return undefined;
  }

  return {
    kind: 'recordShared',
    tableAlias,
    objectMetadataId: flatObjectMetadata.id,
    principalIds,
    accessLevels,
  };
};

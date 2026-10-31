/* @license Enterprise */

import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { buildPrivateRecordCreatorExpression } from 'src/engine/core-modules/record-share/sql/utils/build-private-record-creator-expression.util';
import { resolveNamedPrincipalIds } from 'src/engine/core-modules/record-share/utils/resolve-named-principal-ids.util';
import { resolveObjectSharing } from 'src/engine/core-modules/record-share/utils/resolve-object-sharing.util';
import { resolveRequiredRecordShareAccessLevels } from 'src/engine/core-modules/record-share/utils/resolve-required-record-share-access-levels.util';
import {
  type RowAccessExpression,
  type RowAccessPolicyContext,
  type RowAccessPolicyTarget,
} from 'src/engine/twenty-orm/types/row-access-policy.type';

export const buildNamedRecordGrantExpression = (
  context: RowAccessPolicyContext,
  { tableAlias, flatObjectMetadata, operationType }: RowAccessPolicyTarget,
): RowAccessExpression | undefined => {
  const principalIds = resolveNamedPrincipalIds(context.subject);
  const accessLevels = resolveRequiredRecordShareAccessLevels(operationType);

  if (!isNonEmptyArray(accessLevels)) {
    return undefined;
  }

  const recordShared: RowAccessExpression | undefined = isNonEmptyArray(
    principalIds,
  )
    ? {
        kind: 'recordShared',
        isUncorrelated: true,
        tableAlias,
        objectMetadataId: flatObjectMetadata.id,
        principalIds,
        accessLevels,
      }
    : undefined;

  const { isShareRequired } = resolveObjectSharing({
    flatObjectMetadata,
    featureFlagsMap: context.environment.featureFlagsMap,
  });
  const creator = isShareRequired
    ? undefined
    : buildPrivateRecordCreatorExpression(context, {
        tableAlias,
        flatObjectMetadata,
      });
  const privateRecordCreator: RowAccessExpression | undefined = isDefined(
    creator,
  )
    ? {
        kind: 'and',
        operands: [
          {
            kind: 'recordPrivacy',
            isPrivate: true,
            tableAlias,
            objectMetadataId: flatObjectMetadata.id,
          },
          creator,
        ],
      }
    : undefined;

  const operands = [recordShared, privateRecordCreator].filter(isDefined);

  if (operands.length <= 1) {
    return operands[0];
  }

  return { kind: 'or', operands };
};

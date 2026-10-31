/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { buildPrivateRecordCreatorExpression } from 'src/engine/core-modules/record-share/utils/build-private-record-creator-expression.util';
import { resolveObjectSharing } from 'src/engine/core-modules/record-share/utils/resolve-object-sharing.util';
import { resolveRequiredRecordShareAccessLevels } from 'src/engine/core-modules/record-share/utils/resolve-required-record-share-access-levels.util';
import {
  type RowAccessExpression,
  type RowAccessPolicy,
  type RowAccessPolicyContext,
  type RowAccessPolicyTarget,
} from 'src/engine/twenty-orm/types/row-access-policy.type';

export const buildRecordShareGate = ({
  subject,
  environment,
  tableAlias,
  flatObjectMetadata,
  operationType,
}: RowAccessPolicyContext &
  Pick<
    RowAccessPolicyTarget,
    'tableAlias' | 'flatObjectMetadata' | 'operationType'
  >): RowAccessPolicy => {
  const { isShareable, isShareRequired } = resolveObjectSharing({
    flatObjectMetadata,
    featureFlagsMap: environment.featureFlagsMap,
  });

  if (
    !isShareable ||
    (isShareRequired && subject.isOwningApplication(flatObjectMetadata)) ||
    !isDefined(subject.principalIds)
  ) {
    return { kind: 'open' };
  }

  const accessLevels = resolveRequiredRecordShareAccessLevels(operationType);

  if (accessLevels.length === 0) {
    return { kind: 'open' };
  }

  const recordShared: RowAccessExpression = {
    kind: 'recordShared',
    tableAlias,
    objectMetadataId: flatObjectMetadata.id,
    principalIds: subject.principalIds,
    accessLevels,
  };

  if (isShareRequired) {
    return { kind: 'gated', expression: recordShared };
  }

  const creator = buildPrivateRecordCreatorExpression({
    workspaceMemberId: subject.workspaceMemberId,
    flatFieldMetadataMaps: environment.flatFieldMetadataMaps,
    tableAlias,
    flatObjectMetadata,
  });

  return {
    kind: 'gated',
    expression: {
      kind: 'or',
      operands: [
        {
          kind: 'recordPrivacy',
          isPrivate: false,
          tableAlias,
          objectMetadataId: flatObjectMetadata.id,
        },
        ...(isDefined(creator) ? [creator] : []),
        recordShared,
      ],
    },
  };
};

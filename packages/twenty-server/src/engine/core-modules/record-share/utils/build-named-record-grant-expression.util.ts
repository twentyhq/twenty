/* @license Enterprise */

import { type RecordShareAccessLevel } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { buildPrivateRecordCreatorExpression } from 'src/engine/core-modules/record-share/utils/build-private-record-creator-expression.util';
import { resolveNamedPrincipalIds } from 'src/engine/core-modules/record-share/utils/resolve-named-principal-ids.util';
import { resolveObjectSharing } from 'src/engine/core-modules/record-share/utils/resolve-object-sharing.util';
import { resolveRequiredRecordShareAccessLevels } from 'src/engine/core-modules/record-share/utils/resolve-required-record-share-access-levels.util';
import {
  type RowAccessExpression,
  type RowAccessPolicyContext,
  type RowAccessPolicyTarget,
} from 'src/engine/twenty-orm/types/row-access-policy.type';

type NamedRecordGrantContext = Pick<
  RowAccessPolicyContext,
  'subject' | 'environment'
> &
  Pick<
    RowAccessPolicyTarget,
    'tableAlias' | 'flatObjectMetadata' | 'operationType'
  >;

const buildNamedRecordShareGrant = ({
  subject,
  tableAlias,
  flatObjectMetadata,
  accessLevels,
}: Pick<
  NamedRecordGrantContext,
  'subject' | 'tableAlias' | 'flatObjectMetadata'
> & {
  accessLevels: RecordShareAccessLevel[];
}): RowAccessExpression | undefined => {
  const principalIds = resolveNamedPrincipalIds(subject);

  if (!isNonEmptyArray(principalIds)) {
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

const buildPrivateRecordCreatorGrant = ({
  subject,
  environment,
  tableAlias,
  flatObjectMetadata,
}: Omit<NamedRecordGrantContext, 'operationType'>):
  | RowAccessExpression
  | undefined => {
  const { isShareRequired } = resolveObjectSharing({
    flatObjectMetadata,
    featureFlagsMap: environment.featureFlagsMap,
  });

  if (isShareRequired) {
    return undefined;
  }

  const creator = buildPrivateRecordCreatorExpression({
    workspaceMemberId: subject.workspaceMemberId,
    flatFieldMetadataMaps: environment.flatFieldMetadataMaps,
    tableAlias,
    flatObjectMetadata,
  });

  if (!isDefined(creator)) {
    return undefined;
  }

  return {
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
  };
};

export const buildNamedRecordGrantExpression = ({
  subject,
  environment,
  tableAlias,
  flatObjectMetadata,
  operationType,
}: NamedRecordGrantContext): RowAccessExpression | undefined => {
  const accessLevels = resolveRequiredRecordShareAccessLevels(operationType);

  if (!isNonEmptyArray(accessLevels)) {
    return undefined;
  }

  const operands = [
    buildNamedRecordShareGrant({
      subject,
      tableAlias,
      flatObjectMetadata,
      accessLevels,
    }),
    buildPrivateRecordCreatorGrant({
      subject,
      environment,
      tableAlias,
      flatObjectMetadata,
    }),
  ].filter(isDefined);

  if (operands.length <= 1) {
    return operands[0];
  }

  return { kind: 'or', operands };
};

/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { hasCreatedByField } from 'src/engine/core-modules/record-share/utils/has-created-by-field.util';
import {
  type RowAccessExpression,
  type RowAccessPolicyContext,
  type RowAccessPolicyTarget,
} from 'src/engine/twenty-orm/types/row-access-policy.type';

export const buildPrivateRecordCreatorExpression = (
  { subject, environment }: RowAccessPolicyContext,
  {
    tableAlias,
    flatObjectMetadata,
  }: Pick<RowAccessPolicyTarget, 'tableAlias' | 'flatObjectMetadata'>,
): RowAccessExpression | undefined => {
  if (
    !isDefined(subject.workspaceMemberId) ||
    !hasCreatedByField({
      flatObjectMetadata,
      flatFieldMetadataMaps: environment.flatFieldMetadataMaps,
    })
  ) {
    return undefined;
  }

  return {
    kind: 'recordCreatedBy',
    tableAlias,
    objectMetadataId: flatObjectMetadata.id,
    workspaceMemberId: subject.workspaceMemberId,
  };
};

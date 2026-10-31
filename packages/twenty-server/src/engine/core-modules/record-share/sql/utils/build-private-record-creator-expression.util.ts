/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { hasCreatedByField } from 'src/engine/core-modules/record-share/utils/has-created-by-field.util';
import {
  type RowAccessExpression,
  type RowAccessPolicyEnvironment,
  type RowAccessPolicySubject,
  type RowAccessPolicyTarget,
} from 'src/engine/twenty-orm/types/row-access-policy.type';

export const buildPrivateRecordCreatorExpression = ({
  workspaceMemberId,
  flatFieldMetadataMaps,
  tableAlias,
  flatObjectMetadata,
}: {
  workspaceMemberId: RowAccessPolicySubject['workspaceMemberId'];
  flatFieldMetadataMaps: RowAccessPolicyEnvironment['flatFieldMetadataMaps'];
} & Pick<RowAccessPolicyTarget, 'tableAlias' | 'flatObjectMetadata'>):
  | RowAccessExpression
  | undefined => {
  if (
    !isDefined(workspaceMemberId) ||
    !hasCreatedByField({ flatObjectMetadata, flatFieldMetadataMaps })
  ) {
    return undefined;
  }

  return {
    kind: 'recordCreatedBy',
    tableAlias,
    objectMetadataId: flatObjectMetadata.id,
    workspaceMemberId,
  };
};

/* @license Enterprise */

import { useMutation } from '@apollo/client';

import { UPSERT_ROW_LEVEL_PERMISSION_PREDICATES } from '@/settings/roles/graphql/mutations/upsertRowLevelPermissionPredicatesMutation';
import {
  type RowLevelPermissionPredicate,
  type RowLevelPermissionPredicateGroup,
  type RowLevelPermissionPredicateGroupLogicalOperator,
  type RowLevelPermissionPredicateOperand,
} from '~/generated-metadata/graphql';

export type UpsertRowLevelPermissionPredicatesInput = {
  roleId: string;
  objectMetadataId: string;
  predicates: Array<{
    id?: string;
    fieldMetadataId: string;
    operand: RowLevelPermissionPredicateOperand;
    value?: unknown;
    subFieldName?: string | null;
    workspaceMemberFieldMetadataId?: string | null;
    workspaceMemberSubFieldName?: string | null;
    rowLevelPermissionPredicateGroupId?: string | null;
    positionInRowLevelPermissionPredicateGroup?: number | null;
  }>;
  predicateGroups: Array<{
    id?: string;
    objectMetadataId: string;
    parentRowLevelPermissionPredicateGroupId?: string | null;
    logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator;
    positionInRowLevelPermissionPredicateGroup?: number | null;
  }>;
};

type UpsertRowLevelPermissionPredicatesResult = {
  upsertRowLevelPermissionPredicates: {
    predicates: RowLevelPermissionPredicate[];
    predicateGroups: RowLevelPermissionPredicateGroup[];
  };
};

export const useUpsertRowLevelPermissionPredicatesMutation = () => {
  return useMutation<
    UpsertRowLevelPermissionPredicatesResult,
    { input: UpsertRowLevelPermissionPredicatesInput }
  >(UPSERT_ROW_LEVEL_PERMISSION_PREDICATES);
};

/* @license Enterprise */

import { useMutation } from '@apollo/client/react';

import { UPSERT_ROW_LEVEL_PERMISSION_RULES } from '@/settings/roles/graphql/mutations/upsertRowLevelPermissionRulesMutation';
import {
  type UpsertRowLevelPermissionRulesMutation,
  type UpsertRowLevelPermissionRulesMutationVariables,
} from '~/generated-metadata/graphql';

export const useUpsertRowLevelPermissionRulesMutation = () =>
  useMutation<
    UpsertRowLevelPermissionRulesMutation,
    UpsertRowLevelPermissionRulesMutationVariables
  >(UPSERT_ROW_LEVEL_PERMISSION_RULES);

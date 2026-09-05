import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';
import {
  type RowLevelPermissionPredicate,
  type RowLevelPermissionPredicateGroup,
} from '~/generated-metadata/graphql';

export type SettingsDraftSharingRule = {
  id: string;
  rowLevelPermissionPredicates: RowLevelPermissionPredicate[];
  rowLevelPermissionPredicateGroups: RowLevelPermissionPredicateGroup[];
};

export const settingsDraftSharingRuleFamilyState = createAtomFamilyState<
  SettingsDraftSharingRule,
  string
>({
  key: 'settingsDraftSharingRuleFamilyState',
  scope: 'routed-flow',
  defaultValue: {
    id: '',
    rowLevelPermissionPredicates: [],
    rowLevelPermissionPredicateGroups: [],
  },
});

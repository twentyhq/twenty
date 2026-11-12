import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const settingsRoleExpandedRuleIdsFamilyState = createAtomFamilyState<
  string[],
  string
>({
  key: 'settingsRoleExpandedRuleIdsFamilyState',
  scope: 'routed-flow',
  defaultValue: [],
});

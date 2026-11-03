import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const coreAgentDetailViewFamilyState = createAtomFamilyState<
  'settings' | 'runs',
  string
>({
  key: 'coreAgentDetailViewFamilyState',
  defaultValue: 'settings',
  scope: 'routed-flow',
});

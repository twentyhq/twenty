import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const coreAgentDetailViewLocationKeyFamilyState = createAtomFamilyState<
  string | null,
  string
>({
  key: 'coreAgentDetailViewLocationKeyFamilyState',
  scope: 'routed-flow',
  defaultValue: null,
});

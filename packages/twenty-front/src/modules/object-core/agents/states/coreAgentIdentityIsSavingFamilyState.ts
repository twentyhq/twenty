import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const coreAgentIdentityIsSavingFamilyState = createAtomFamilyState<
  boolean,
  string
>({
  key: 'coreAgentIdentityIsSavingFamilyState',
  scope: 'routed-flow',
  defaultValue: false,
});

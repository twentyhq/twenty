import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const coreAgentIsRunsViewFamilyState = createAtomFamilyState<
  boolean,
  string
>({
  key: 'coreAgentIsRunsViewFamilyState',
  defaultValue: false,
});

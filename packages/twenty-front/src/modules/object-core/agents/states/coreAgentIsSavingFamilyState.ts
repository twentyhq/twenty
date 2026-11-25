import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const coreAgentIsSavingFamilyState = createAtomFamilyState<
  boolean,
  string
>({
  key: 'coreAgentIsSavingFamilyState',
  defaultValue: false,
});

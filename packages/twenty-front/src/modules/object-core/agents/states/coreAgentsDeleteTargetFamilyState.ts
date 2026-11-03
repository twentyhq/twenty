import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const coreAgentsDeleteTargetFamilyState = createAtomFamilyState<
  string[],
  string
>({
  key: 'coreAgentsDeleteTargetFamilyState',
  defaultValue: [],
});

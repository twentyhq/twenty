import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const coreAgentsIsDeletingFamilyState = createAtomFamilyState<
  boolean,
  string
>({
  key: 'coreAgentsIsDeletingFamilyState',
  defaultValue: false,
});

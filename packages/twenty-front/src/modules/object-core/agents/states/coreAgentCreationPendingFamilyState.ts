import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const coreAgentCreationPendingFamilyState = createAtomFamilyState<
  boolean,
  string
>({
  key: 'coreAgentCreationPendingFamilyState',
  defaultValue: false,
});

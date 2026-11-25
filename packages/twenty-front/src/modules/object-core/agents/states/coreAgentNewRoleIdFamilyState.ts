import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const coreAgentNewRoleIdFamilyState = createAtomFamilyState<
  string | undefined,
  string
>({
  key: 'coreAgentNewRoleIdFamilyState',
  defaultValue: undefined,
});

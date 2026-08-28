import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
export const isMultiWorkspaceSubdomainEnabledState = createAtomState<boolean>({
  key: 'isMultiWorkspaceSubdomainEnabled',
  defaultValue: true,
});

import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
export const isMultiWorkspaceEnabledState = createAtomState<boolean>({
  key: 'isMultiWorkspaceEnabled',
  defaultValue: false,
});

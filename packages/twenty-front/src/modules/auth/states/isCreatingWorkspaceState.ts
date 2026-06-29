import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const isCreatingWorkspaceState = createAtomState<boolean>({
  key: 'isCreatingWorkspaceState',
  defaultValue: false,
});

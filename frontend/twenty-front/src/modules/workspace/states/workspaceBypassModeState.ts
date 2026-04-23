import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const workspaceBypassModeState = createAtomState<boolean>({
  key: 'workspaceBypassModeState',
  defaultValue: false,
});

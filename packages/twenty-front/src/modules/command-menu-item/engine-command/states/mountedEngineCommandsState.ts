import { type MountedCommandState } from '@/command-menu-item/engine-command/types/MountedCommandState';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const mountedCommandsState = createAtomState<
  Map<string, MountedCommandState>
>({
  key: 'mountedCommandsState',
  defaultValue: new Map(),
});

import { type MountedEngineCommandState } from '@/command-menu-item/engine-command/types/MountedEngineCommandContext';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const mountedEngineCommandsState = createAtomState<
  Map<string, MountedEngineCommandState>
>({
  key: 'mountedEngineCommandsState',
  defaultValue: new Map(),
});

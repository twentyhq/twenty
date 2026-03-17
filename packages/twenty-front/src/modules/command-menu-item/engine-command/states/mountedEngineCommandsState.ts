import { type MountedEngineCommandContext } from '@/command-menu-item/engine-command/types/MountedEngineCommandContext';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const mountedEngineCommandsState = createAtomState<
  Map<string, MountedEngineCommandContext>
>({
  key: 'mountedEngineCommandsState',
  defaultValue: new Map(),
});

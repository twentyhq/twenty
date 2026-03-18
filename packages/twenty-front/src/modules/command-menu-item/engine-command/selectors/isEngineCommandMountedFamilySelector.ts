import { mountedEngineCommandsState } from '@/command-menu-item/engine-command/states/mountedEngineCommandsState';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';

export const isEngineCommandMountedFamilySelector = createAtomFamilySelector<
  boolean,
  string
>({
  key: 'isEngineCommandMountedFamilySelector',
  get:
    (engineCommandId: string) =>
    ({ get }) => {
      const mountedMap = get(mountedEngineCommandsState);

      return mountedMap.has(engineCommandId);
    },
});

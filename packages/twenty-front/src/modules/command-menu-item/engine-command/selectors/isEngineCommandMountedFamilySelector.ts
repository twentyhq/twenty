import { headlessCommandContextApisState } from '@/command-menu-item/engine-command/states/headlessCommandContextApisState';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';

export const isEngineCommandMountedFamilySelector = createAtomFamilySelector<
  boolean,
  string
>({
  key: 'isEngineCommandMountedFamilySelector',
  get:
    (engineCommandId: string) =>
    ({ get }) => {
      const headlessCommandContextApis = get(headlessCommandContextApisState);

      return headlessCommandContextApis.has(engineCommandId);
    },
});

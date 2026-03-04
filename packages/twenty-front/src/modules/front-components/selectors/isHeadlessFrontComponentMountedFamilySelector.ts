import { mountedHeadlessFrontComponentMapsState } from '@/front-components/states/mountedHeadlessFrontComponentMapsState';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';

export const isHeadlessFrontComponentMountedFamilySelector =
  createAtomFamilySelector<boolean, string>({
    key: 'isHeadlessFrontComponentMountedFamilySelector',
    get:
      (frontComponentId: string) =>
      ({ get }) => {
        const mountedMap = get(mountedHeadlessFrontComponentMapsState);

        return mountedMap.has(frontComponentId);
      },
  });

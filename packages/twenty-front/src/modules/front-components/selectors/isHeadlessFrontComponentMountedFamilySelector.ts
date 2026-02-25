import { mountedHeadlessFrontComponentIdsState } from '@/front-components/states/mountedHeadlessFrontComponentIdsState';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';

export const isHeadlessFrontComponentMountedFamilySelector =
  createAtomFamilySelector<boolean, string>({
    key: 'isHeadlessFrontComponentMountedFamilySelector',
    get:
      (frontComponentId: string) =>
      ({ get }) => {
        const mountedIds = get(mountedHeadlessFrontComponentIdsState);

        return mountedIds.has(frontComponentId);
      },
  });

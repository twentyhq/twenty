import { mountedHeadlessFrontComponentIdsState } from '@/front-components/states/mountedHeadlessFrontComponentIdsState';
import { createFamilySelector } from '@/ui/utilities/state/jotai/utils/createFamilySelector';

export const isHeadlessFrontComponentMountedFamilySelector =
  createFamilySelector<boolean, string>({
    key: 'isHeadlessFrontComponentMountedFamilySelector',
    get:
      (frontComponentId: string) =>
      ({ get }) => {
        const mountedIds = get(mountedHeadlessFrontComponentIdsState);

        return mountedIds.has(frontComponentId);
      },
  });

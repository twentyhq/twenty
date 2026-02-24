import { mountedHeadlessFrontComponentIdsState } from '@/front-components/states/mountedHeadlessFrontComponentIdsState';
import { createFamilySelectorV2 } from '@/ui/utilities/state/jotai/utils/createFamilySelectorV2';

export const isHeadlessFrontComponentMountedFamilySelector =
  createFamilySelectorV2<boolean, string>({
    key: 'isHeadlessFrontComponentMountedFamilySelector',
    get:
      (frontComponentId: string) =>
      ({ get }) => {
        const mountedIds = get(mountedHeadlessFrontComponentIdsState);

        return mountedIds.has(frontComponentId);
      },
  });

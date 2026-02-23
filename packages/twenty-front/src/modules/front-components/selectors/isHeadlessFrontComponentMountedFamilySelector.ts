import { selectorFamily } from 'recoil';

import { mountedHeadlessFrontComponentIdsState } from '@/front-components/states/mountedHeadlessFrontComponentIdsState';

export const isHeadlessFrontComponentMountedFamilySelector = selectorFamily<
  boolean,
  string
>({
  key: 'isHeadlessFrontComponentMountedFamilySelector',
  get:
    (frontComponentId: string) =>
    ({ get }) => {
      const mountedIds = get(mountedHeadlessFrontComponentIdsState);

      return mountedIds.has(frontComponentId);
    },
});

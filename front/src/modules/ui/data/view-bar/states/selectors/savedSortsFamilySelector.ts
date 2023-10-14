import { selectorFamily } from 'recoil';

import { savedSortsFamilyState } from '../savedSortsFamilyState';

export const savedSortsFamilySelector = selectorFamily({
  key: 'savedSortsFamilySelector',
  get:
    (viewId: string | undefined) =>
    ({ get }) =>
      get(savedSortsFamilyState(viewId)),
});

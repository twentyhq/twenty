import { selectorFamily } from 'recoil';

import { savedFiltersFamilyState } from '../savedFiltersFamilyState';

export const savedFiltersFamilySelector = selectorFamily({
  key: 'savedFiltersFamilySelector',
  get:
    (viewId: string | undefined) =>
    ({ get }) =>
      get(savedFiltersFamilyState(viewId)),
});

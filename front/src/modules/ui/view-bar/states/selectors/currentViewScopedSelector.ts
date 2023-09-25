import { selectorFamily } from 'recoil';

import { View } from '../../types/View';
import { currentViewIdScopedState } from '../currentViewIdScopedState';

import { viewsByIdScopedSelector } from './viewsByIdScopedSelector';

export const currentViewScopedSelector = selectorFamily<
  View | undefined,
  string
>({
  key: 'currentViewScopedSelector',
  get:
    (scopeId) =>
    ({ get }) => {
      const currentViewId = get(currentViewIdScopedState(scopeId));
      return currentViewId
        ? get(viewsByIdScopedSelector(scopeId))[currentViewId]
        : undefined;
    },
});

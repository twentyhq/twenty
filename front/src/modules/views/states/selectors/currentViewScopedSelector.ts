import { selectorFamily } from 'recoil';

import { View } from '../../../ui/data/view-bar/types/View';
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
      const currentViewId = get(currentViewIdScopedState({ scopeId: scopeId }));
      return currentViewId
        ? get(viewsByIdScopedSelector(scopeId))[currentViewId]
        : undefined;
    },
});

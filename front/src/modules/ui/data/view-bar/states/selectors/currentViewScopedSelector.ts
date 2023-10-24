import { selectorFamily } from 'recoil';

import { currentViewIdScopedState } from '../../../../../views/states/currentViewIdScopedState';
import { View } from '../../types/View';

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

import { selectorFamily } from 'recoil';

import { type View } from '../../types/View';
import { viewsScopedState } from '../viewsScopedState';

export const viewsByIdScopedSelector = selectorFamily<
  Record<string, View>,
  string
>({
  key: 'viewsByIdScopedSelector',
  get:
    (scopeId) =>
    ({ get }) =>
      get(viewsScopedState(scopeId)).reduce<Record<string, View>>(
        (result, view) => ({ ...result, [view.id]: view }),
        {},
      ),
});

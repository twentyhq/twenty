import { selectorFamily } from 'recoil';

import { GraphQLView } from '@/views/types/GraphQLView';

import { viewsScopedState } from '../viewsScopedState';

export const viewsByIdScopedSelector = selectorFamily<
  Record<string, GraphQLView>,
  string
>({
  key: 'viewsByIdScopedSelector',
  get:
    (scopeId) =>
    ({ get }) =>
      get(viewsScopedState({ scopeId: scopeId })).reduce<
        Record<string, GraphQLView>
      >((result, view) => ({ ...result, [view.id]: view }), {}),
});

import { createScopedSelector } from '@/ui/utilities/recoil-scope/utils/createScopedSelector';
import { GraphQLView } from '@/views/types/GraphQLView';

import { currentViewIdScopedState } from '../currentViewIdScopedState';

import { viewsByIdScopedSelector } from './viewsByIdScopedSelector';

export const currentViewScopedSelector = createScopedSelector<
  GraphQLView | undefined
>({
  key: 'currentViewScopedSelector',
  get:
    ({ scopeId }: { scopeId: string }) =>
    ({ get }) => {
      const currentViewId = get(currentViewIdScopedState({ scopeId: scopeId }));

      return currentViewId
        ? get(viewsByIdScopedSelector(scopeId))[currentViewId]
        : undefined;
    },
});

import { createComponentReadOnlySelector } from '@/ui/utilities/state/component-state/utils/createComponentReadOnlySelector';
import { GraphQLView } from '@/views/types/GraphQLView';

import { currentViewIdScopedState } from '../currentViewIdScopedState';

import { viewsByIdScopedSelector } from './viewsByIdScopedSelector';

export const currentViewComponentSelector = createComponentReadOnlySelector<
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

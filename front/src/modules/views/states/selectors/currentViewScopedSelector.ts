import { createScopedSelector } from '@/ui/utilities/recoil-scope/utils/createScopedSelector';
import { View } from '@/views/types/View';

import { currentViewIdScopedState } from '../currentViewIdScopedState';

import { viewsByIdScopedSelector } from './viewsByIdScopedSelector';

export const currentViewScopedSelector = createScopedSelector<View | undefined>(
  {
    key: 'currentViewScopedSelector',
    get:
      ({ scopeId }: { scopeId: string }) =>
      ({ get }) => {
        const currentViewId = get(
          currentViewIdScopedState({ scopeId: scopeId }),
        );

        return currentViewId
          ? get(viewsByIdScopedSelector(scopeId))[currentViewId]
          : undefined;
      },
  },
);

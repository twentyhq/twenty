import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';
import { localStorageEffect } from '~/utils/recoil-effects';

export const lastVisitedPageOrViewState = createComponentState<Record<
  string,
  string
> | null>({
  key: 'lastVisitedPageOrViewState',
  defaultValue: null,
  effects: [localStorageEffect()],
});

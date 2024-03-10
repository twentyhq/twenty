import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const currentViewIdScopedState = createComponentState<
  string | undefined
>({
  key: 'currentViewIdScopedState',
  defaultValue: undefined,
});

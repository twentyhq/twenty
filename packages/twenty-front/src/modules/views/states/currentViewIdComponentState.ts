import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const currentViewIdComponentState = createComponentState<
  string | undefined
>({
  key: 'currentViewIdComponentState',
  defaultValue: undefined,
});

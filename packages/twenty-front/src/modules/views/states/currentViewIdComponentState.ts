import { createComponentState } from 'twenty-ui';

export const currentViewIdComponentState = createComponentState<
  string | undefined
>({
  key: 'currentViewIdComponentState',
  defaultValue: undefined,
});

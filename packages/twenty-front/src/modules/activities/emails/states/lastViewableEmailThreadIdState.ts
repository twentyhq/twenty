import { createState } from 'twenty-ui';

export const emailThreadIdWhenEmailThreadWasClosedState = createState<
  string | null
>({
  key: 'emailThreadIdWhenEmailThreadWasClosedState',
  defaultValue: null,
});

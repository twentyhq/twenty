import { createState } from '@ui/utilities/state/utils/createState';

export const emailThreadIdWhenEmailThreadWasClosedState = createState<
  string | null
>({
  key: 'emailThreadIdWhenEmailThreadWasClosedState',
  defaultValue: null,
});

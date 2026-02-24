import { createState } from '@/ui/utilities/state/jotai/utils/createState';
export const emailThreadIdWhenEmailThreadWasClosedState = createState<
  string | null
>({
  key: 'emailThreadIdWhenEmailThreadWasClosedState',
  defaultValue: null,
});

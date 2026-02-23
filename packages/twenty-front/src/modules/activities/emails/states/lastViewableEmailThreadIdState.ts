import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';
export const emailThreadIdWhenEmailThreadWasClosedState = createStateV2<
  string | null
>({
  key: 'emailThreadIdWhenEmailThreadWasClosedState',
  defaultValue: null,
});

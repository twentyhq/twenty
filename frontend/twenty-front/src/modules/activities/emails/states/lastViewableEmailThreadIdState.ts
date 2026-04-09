import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
export const emailThreadIdWhenEmailThreadWasClosedState = createAtomState<
  string | null
>({
  key: 'emailThreadIdWhenEmailThreadWasClosedState',
  defaultValue: null,
});

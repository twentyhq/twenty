import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const onboardingInviteTeamEmailsDraftState = createAtomState<
  string[] | null
>({
  key: 'onboardingInviteTeamEmailsDraftState',
  defaultValue: null,
});

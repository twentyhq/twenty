import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const onboardingInviteTeamHasTypedEmailState = createAtomState<boolean>({
  key: 'onboardingInviteTeamHasTypedEmailState',
  defaultValue: false,
});

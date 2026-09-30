import { onboardingInviteTeamEmailsDraftState } from '@/onboarding/states/onboardingInviteTeamEmailsDraftState';
import { getValidInviteEmails } from '@/onboarding/utils/getValidInviteEmails';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

export const onboardingInviteTeamValidEmailsSelector = createAtomSelector<
  string[]
>({
  key: 'onboardingInviteTeamValidEmailsSelector',
  get: ({ get }) =>
    getValidInviteEmails(get(onboardingInviteTeamEmailsDraftState) ?? []),
});

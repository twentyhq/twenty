import { render } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { onboardingConfigState } from '@/client-config/states/onboardingConfigState';
import { InviteTeamCreditsEffect } from '@/onboarding/components/InviteTeamCreditsEffect';
import { ONBOARDING_FREE_CREDITS_DEFAULT_VALUE } from '@/onboarding/constants/OnboardingFreeCreditsDefaultValue';
import { onboardingFreeCreditsFamilyState } from '@/onboarding/states/onboardingFreeCreditsFamilyState';
import { onboardingInviteTeamEmailsDraftState } from '@/onboarding/states/onboardingInviteTeamEmailsDraftState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';

const getInviteTeamCredits = () =>
  jotaiStore.get(
    onboardingFreeCreditsFamilyState.atomFamily(mockCurrentWorkspace.id),
  ).inviteTeam;

const renderInviteTeamCreditsEffect = () =>
  render(
    <JotaiProvider store={jotaiStore}>
      <InviteTeamCreditsEffect />
    </JotaiProvider>,
  );

describe('InviteTeamCreditsEffect', () => {
  beforeEach(() => {
    localStorage.clear();
    resetJotaiStore();
    jotaiStore.set(currentWorkspaceState.atom, mockCurrentWorkspace);
    jotaiStore.set(onboardingConfigState.atom, {
      importContactsCreditsReward: 1,
      inviteTeamCreditsRewardPerUser: 0.5,
      installAppsCreditsReward: 0.5,
      createProfileCreditsReward: 0.5,
      upgradeCreditsReward: 2,
      inviteTeamMaxInvites: 5,
    });
    jotaiStore.set(
      onboardingFreeCreditsFamilyState.atomFamily(mockCurrentWorkspace.id),
      {
        ...ONBOARDING_FREE_CREDITS_DEFAULT_VALUE,
        inviteTeam: 1,
        seenCredits: 1,
      },
    );
  });

  it('should drop the typed invite credits when the page reloads without a draft', () => {
    renderInviteTeamCreditsEffect();

    expect(getInviteTeamCredits()).toBe(0);
  });

  it('should count the valid emails of the invite draft', () => {
    jotaiStore.set(onboardingInviteTeamEmailsDraftState.atom, [
      'tim@apple.com',
      'not-an-email',
      '',
    ]);

    renderInviteTeamCreditsEffect();

    expect(getInviteTeamCredits()).toBe(0.5);
  });
});

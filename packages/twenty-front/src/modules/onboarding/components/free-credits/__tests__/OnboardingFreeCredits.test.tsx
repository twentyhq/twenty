import { MockedProvider } from '@apollo/client/testing/react';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { type OnboardingConfig } from '@/client-config/types/OnboardingConfig';
import { OnboardingFreeCredits } from '@/onboarding/components/free-credits/OnboardingFreeCredits';
import { onboardingSeenFreeCreditsByWorkspaceIdState } from '@/onboarding/states/onboardingSeenFreeCreditsByWorkspaceIdState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import {
  GetOnboardingCreditRewardsDocument,
  type OnboardingCreditRewards,
  OnboardingStatus,
} from '~/generated-metadata/graphql';
import { messages } from '~/locales/generated/en';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';

i18n.load({ [SOURCE_LOCALE]: messages });
i18n.activate(SOURCE_LOCALE);

const onboardingConfig: OnboardingConfig = {
  importContactsCreditsReward: 2,
  inviteTeamCreditsRewardPerUser: 0.5,
  installAppsCreditsRewardPerApp: 1,
  inviteTeamMaxInvites: 4,
};

const NO_CREDIT_REWARDS: Omit<OnboardingCreditRewards, '__typename'> = {
  importContactsCredits: 0,
  installAppsCredits: 0,
  inviteTeamCredits: 0,
  enrichmentQualificationCredits: 0,
  totalCredits: 0,
  joinedTeammatesCount: 0,
  pendingInvitationsCount: 0,
};

const renderFreeCredits = (
  creditRewards: Partial<Omit<OnboardingCreditRewards, '__typename'>> = {},
) =>
  render(<OnboardingFreeCredits onboardingConfig={onboardingConfig} />, {
    wrapper: ({ children }: { children: ReactNode }) => (
      <MockedProvider
        mocks={[
          {
            request: { query: GetOnboardingCreditRewardsDocument },
            result: {
              data: {
                getOnboardingCreditRewards: {
                  __typename: 'OnboardingCreditRewards',
                  ...NO_CREDIT_REWARDS,
                  ...creditRewards,
                },
              },
            },
          },
        ]}
      >
        <JotaiProvider store={jotaiStore}>
          <I18nProvider i18n={i18n}>{children}</I18nProvider>
        </JotaiProvider>
      </MockedProvider>
    ),
  });

const setOnboardingStatus = (onboardingStatus: OnboardingStatus) =>
  jotaiStore.set(currentUserState.atom, {
    id: 'user-id',
    onboardingStatus,
  } as never);

const markCreditsAsSeen = (credits: number) =>
  jotaiStore.set(onboardingSeenFreeCreditsByWorkspaceIdState.atom, {
    [mockCurrentWorkspace.id]: credits,
  });

const openFreeCreditsPopover = async () => {
  await userEvent.click(await screen.findByRole('button'));

  return within(await screen.findByRole('dialog', { name: 'Free credits' }));
};

describe('OnboardingFreeCredits', () => {
  beforeEach(() => {
    localStorage.clear();
    resetJotaiStore();
    jotaiStore.set(currentWorkspaceState.atom, mockCurrentWorkspace);
  });

  it('should invite to earn the email reward on the first step', async () => {
    setOnboardingStatus(OnboardingStatus.SYNC_EMAIL);

    renderFreeCredits();

    expect(await screen.findByText('Earn 2')).toBeInTheDocument();
    expect(
      await screen.findByText('Connect your mailbox to earn 2 free credits'),
    ).toBeInTheDocument();
  });

  it('should track progress toward every setup reward after the first step', async () => {
    setOnboardingStatus(OnboardingStatus.APPS_INSTALLATION);
    markCreditsAsSeen(2);

    renderFreeCredits({ importContactsCredits: 2, totalCredits: 2 });

    expect(await screen.findByText('2/7')).toBeInTheDocument();
    expect(
      await screen.findByText('Earn 1 free credit per app you install'),
    ).toBeInTheDocument();
  });

  it('should explain what credits are worth and list the rewards reached so far', async () => {
    setOnboardingStatus(OnboardingStatus.APPS_INSTALLATION);
    markCreditsAsSeen(2);

    renderFreeCredits({ importContactsCredits: 2, totalCredits: 2 });

    const popover = await openFreeCreditsPopover();

    expect(popover.getByText('Worth on average')).toBeInTheDocument();
    expect(popover.getByText('48')).toBeInTheDocument();
    expect(popover.getByText('Connect your email')).toBeInTheDocument();
    expect(popover.getByText('+2')).toBeInTheDocument();
    expect(popover.getByText('Install apps')).toBeInTheDocument();
    expect(popover.getByText('+1 each')).toBeInTheDocument();
    expect(popover.queryByText('Invite teammates')).not.toBeInTheDocument();
  });

  it('should show invitations still pending', async () => {
    setOnboardingStatus(OnboardingStatus.COMPLETED);
    markCreditsAsSeen(2);

    renderFreeCredits({
      importContactsCredits: 2,
      totalCredits: 2,
      pendingInvitationsCount: 3,
    });

    const popover = await openFreeCreditsPopover();

    expect(popover.getByText('3 invites pending')).toBeInTheDocument();
  });

  it('should celebrate credits the user has not seen yet', async () => {
    setOnboardingStatus(OnboardingStatus.PROFILE_CREATION);

    renderFreeCredits({ installAppsCredits: 1, totalCredits: 1 });

    expect(await screen.findByText('+1')).toBeInTheDocument();
    expect(
      await screen.findByText('You earned 1 free credit'),
    ).toBeInTheDocument();
  });

  it('should only offer first-member rewards to the first member', async () => {
    jotaiStore.set(currentWorkspaceState.atom, {
      ...mockCurrentWorkspace,
      workspaceMembersCount: 2,
    });
    setOnboardingStatus(OnboardingStatus.SYNC_EMAIL);

    renderFreeCredits();

    const popover = await openFreeCreditsPopover();

    expect(popover.queryByText('Connect your email')).not.toBeInTheDocument();
    expect(popover.queryByText('Install apps')).not.toBeInTheDocument();
    expect(popover.getByText('Invite teammates')).toBeInTheDocument();
  });
});

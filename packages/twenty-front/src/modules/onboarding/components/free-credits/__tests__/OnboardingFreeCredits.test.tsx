import { MockedProvider } from '@apollo/client/testing/react';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

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
} from '~/generated-metadata/graphql';
import { messages } from '~/locales/generated/en';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';

i18n.load({ [SOURCE_LOCALE]: messages });
i18n.activate(SOURCE_LOCALE);

const onboardingConfig: OnboardingConfig = {
  importContactsCreditsReward: 2,
  inviteTeamCreditsRewardPerUser: 0.5,
  installAppsCreditsRewardPerApp: 1,
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

const openChecklist = async () => {
  await userEvent.click(await screen.findByRole('button'));

  return within(await screen.findByRole('dialog', { name: 'Free credits' }));
};

describe('OnboardingFreeCredits', () => {
  beforeEach(() => {
    localStorage.clear();
    resetJotaiStore();
    jotaiStore.set(currentWorkspaceState.atom, mockCurrentWorkspace);
  });

  it('should list each way to earn free credits with its reward', async () => {
    renderFreeCredits();

    const checklist = await openChecklist();

    expect(checklist.getByText('Connect your email')).toBeInTheDocument();
    expect(checklist.getByText('+2 free credits')).toBeInTheDocument();
    expect(checklist.getByText('Install apps')).toBeInTheDocument();
    expect(
      checklist.getByText('+1 free credit per app installed'),
    ).toBeInTheDocument();
    expect(checklist.getByText('Invite teammates')).toBeInTheDocument();
    expect(
      checklist.getByText('+0.5 free credits per teammate who joins'),
    ).toBeInTheDocument();
  });

  it('should show earned rewards and invitations still pending', async () => {
    jotaiStore.set(onboardingSeenFreeCreditsByWorkspaceIdState.atom, {
      [mockCurrentWorkspace.id]: 2,
    });

    renderFreeCredits({
      importContactsCredits: 2,
      totalCredits: 2,
      pendingInvitationsCount: 3,
    });

    const checklist = await openChecklist();

    expect(checklist.getByText('+2')).toBeInTheDocument();
    expect(checklist.getByText('3 invites pending')).toBeInTheDocument();
  });

  it('should announce credits the user has not seen yet', async () => {
    renderFreeCredits({ installAppsCredits: 1, totalCredits: 1 });

    expect(await screen.findByText('+1')).toBeInTheDocument();
  });

  it('should only offer first-member rewards to the first member', async () => {
    jotaiStore.set(currentWorkspaceState.atom, {
      ...mockCurrentWorkspace,
      workspaceMembersCount: 2,
    });

    renderFreeCredits();

    const checklist = await openChecklist();

    expect(checklist.queryByText('Connect your email')).not.toBeInTheDocument();
    expect(checklist.queryByText('Install apps')).not.toBeInTheDocument();
    expect(checklist.getByText('Invite teammates')).toBeInTheDocument();
  });
});

import { MockedProvider } from '@apollo/client/testing/react';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { onboardingConfigState } from '@/client-config/states/onboardingConfigState';
import { type OnboardingConfig } from '@/client-config/types/OnboardingConfig';
import { OnboardingStepLayout } from '@/onboarding/components/OnboardingStepLayout';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { ToastProvider } from 'twenty-ui/components';
import {
  GetOnboardingCreditRewardsDocument,
  OnboardingStatus,
} from '~/generated-metadata/graphql';
import { messages } from '~/locales/generated/en';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';

jest.mock(
  '@/onboarding/effect-components/PrefetchPlanRequiredStepEffect',
  () => ({
    PrefetchPlanRequiredStepEffect: () => null,
  }),
);

jest.mock('@/onboarding/components/OnboardingTransitionOutlet', () => ({
  OnboardingTransitionOutlet: () => null,
}));

i18n.load({ [SOURCE_LOCALE]: messages });
i18n.activate(SOURCE_LOCALE);

const onboardingConfig: OnboardingConfig = {
  importContactsCreditsReward: 2,
  inviteTeamCreditsRewardPerUser: 3,
  installAppsCreditsRewardPerApp: 1,
  inviteTeamMaxInvites: 2,
};

const buildCreditRewardsMock = (totalCredits: number) => ({
  request: { query: GetOnboardingCreditRewardsDocument },
  result: {
    data: {
      getOnboardingCreditRewards: {
        __typename: 'OnboardingCreditRewards',
        importContactsCredits: totalCredits,
        installAppsCredits: 0,
        inviteTeamCredits: 0,
        enrichmentQualificationCredits: 0,
        totalCredits,
        joinedTeammatesCount: 0,
        pendingInvitationsCount: 0,
      },
    },
  },
});

const renderOnboardingStepLayout = (totalCredits: number) =>
  render(<OnboardingStepLayout />, {
    wrapper: ({ children }: { children: ReactNode }) => (
      <MockedProvider mocks={[buildCreditRewardsMock(totalCredits)]}>
        <JotaiProvider store={jotaiStore}>
          <ToastProvider>
            <I18nProvider i18n={i18n}>{children}</I18nProvider>
          </ToastProvider>
        </JotaiProvider>
      </MockedProvider>
    ),
  });

const setOnboardingStatus = (onboardingStatus: OnboardingStatus) =>
  jotaiStore.set(currentUserState.atom, {
    id: 'user-id',
    onboardingStatus,
  } as never);

describe('OnboardingStepLayout', () => {
  beforeEach(() => {
    localStorage.clear();
    resetJotaiStore();
    jotaiStore.set(currentWorkspaceState.atom, mockCurrentWorkspace);
  });

  it('should invite to earn the email reward on the first step', async () => {
    jotaiStore.set(onboardingConfigState.atom, onboardingConfig);
    setOnboardingStatus(OnboardingStatus.SYNC_EMAIL);

    renderOnboardingStepLayout(0);

    expect(await screen.findByText('Earn 2')).toBeInTheDocument();
  });

  it('should display the free credits granted so far out of the setup total', async () => {
    jotaiStore.set(onboardingConfigState.atom, onboardingConfig);
    setOnboardingStatus(OnboardingStatus.PROFILE_CREATION);

    renderOnboardingStepLayout(1.5);

    expect(await screen.findByText('1.5/11')).toBeInTheDocument();
    expect(screen.getByText('free credits')).toBeInTheDocument();
  });

  it('should hide the free credits pill when credits rewards are not configured', () => {
    jotaiStore.set(onboardingConfigState.atom, null);

    setOnboardingStatus(OnboardingStatus.SYNC_EMAIL);

    renderOnboardingStepLayout(0);

    expect(screen.queryByText('Earn 2')).not.toBeInTheDocument();
  });
});

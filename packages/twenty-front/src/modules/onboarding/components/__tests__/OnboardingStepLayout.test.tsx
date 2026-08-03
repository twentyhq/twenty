import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { onboardingConfigState } from '@/client-config/states/onboardingConfigState';
import { type OnboardingConfig } from '@/client-config/types/OnboardingConfig';
import { OnboardingStepLayout } from '@/onboarding/components/OnboardingStepLayout';
import { onboardingFreeCreditsState } from '@/onboarding/states/onboardingFreeCreditsState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { messages } from '~/locales/generated/en';

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
  inviteTeamMaxCreditsReward: 9,
  inviteTeamCreditsRewardPerUser: 3,
  upgradeCreditsReward: 5,
  installAppsCreditsRewardPerApp: 1,
};

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>
    <I18nProvider i18n={i18n}>{children}</I18nProvider>
  </JotaiProvider>
);

describe('OnboardingStepLayout', () => {
  beforeEach(() => {
    localStorage.clear();
    resetJotaiStore();
    jotaiStore.set(onboardingFreeCreditsState.atom, {
      importContacts: 2,
      inviteTeam: 3,
      installApps: 1,
    });
  });

  it('should display the free credits pill when credits rewards are configured', () => {
    jotaiStore.set(onboardingConfigState.atom, onboardingConfig);

    render(<OnboardingStepLayout />, { wrapper: Wrapper });

    expect(screen.getByText('free credits')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
  });

  it('should hide the free credits pill when credits rewards are not configured', () => {
    jotaiStore.set(onboardingConfigState.atom, null);

    render(<OnboardingStepLayout />, { wrapper: Wrapper });

    expect(screen.queryByText('free credits')).not.toBeInTheDocument();
  });
});

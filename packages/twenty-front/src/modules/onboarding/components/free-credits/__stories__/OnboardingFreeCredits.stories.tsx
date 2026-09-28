import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, waitFor, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { onboardingConfigState } from '@/client-config/states/onboardingConfigState';
import { OnboardingFreeCredits } from '@/onboarding/components/free-credits/OnboardingFreeCredits';
import { ONBOARDING_FREE_CREDITS_DEFAULT_VALUE } from '@/onboarding/constants/OnboardingFreeCreditsDefaultValue';
import { onboardingFreeCreditsFamilyState } from '@/onboarding/states/onboardingFreeCreditsFamilyState';
import { type OnboardingFreeCredits as OnboardingFreeCreditsCounter } from '@/onboarding/types/OnboardingFreeCredits';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { OnboardingStatus } from '~/generated-metadata/graphql';
import { WorkspaceDecorator } from '~/testing/decorators/WorkspaceDecorator';
import {
  mockCurrentWorkspace,
  mockedUserData,
} from '~/testing/mock-data/users';

const seedOnboardingFreeCredits = ({
  onboardingStatus,
  onboardingFreeCredits = {},
}: {
  onboardingStatus: OnboardingStatus;
  onboardingFreeCredits?: Partial<OnboardingFreeCreditsCounter>;
}) => {
  jotaiStore.set(onboardingConfigState.atom, {
    importContactsCreditsReward: 1,
    inviteTeamCreditsRewardPerUser: 0.5,
    installAppsCreditsReward: 0.5,
    createProfileCreditsReward: 0.5,
    upgradeCreditsReward: 2,
    inviteTeamMaxInvites: 10,
  });
  jotaiStore.set(currentUserState.atom, {
    ...mockedUserData,
    isWorkspaceCreator: true,
    onboardingStatus,
  });
  jotaiStore.set(currentWorkspaceState.atom, mockCurrentWorkspace);
  jotaiStore.set(
    onboardingFreeCreditsFamilyState.atomFamily(mockCurrentWorkspace.id),
    {
      ...ONBOARDING_FREE_CREDITS_DEFAULT_VALUE,
      ...onboardingFreeCredits,
    },
  );
};

const findVisibleTooltip = async (canvasElement: HTMLElement, text: string) => {
  const tooltip = await within(canvasElement.ownerDocument.body).findByText(
    text,
  );

  await waitFor(() => expect(tooltip).toBeVisible());
};

const meta: Meta<typeof OnboardingFreeCredits> = {
  title: 'Modules/Onboarding/FreeCredits',
  component: OnboardingFreeCredits,
  decorators: [ComponentDecorator, WorkspaceDecorator],
  parameters: {
    container: { width: 360, height: 560 },
  },
};

export default meta;
type Story = StoryObj<typeof OnboardingFreeCredits>;

export const FirstStep: Story = {
  beforeEach: () => {
    seedOnboardingFreeCredits({
      onboardingStatus: OnboardingStatus.SYNC_EMAIL,
    });
  },
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByText('Earn 1'),
    ).toBeVisible();
    await findVisibleTooltip(
      canvasElement,
      'Connect your mailbox to earn 1 free credit',
    );
  },
};

export const EarnedSoFar: Story = {
  beforeEach: () => {
    seedOnboardingFreeCredits({
      onboardingStatus: OnboardingStatus.APPS_INSTALLATION,
      onboardingFreeCredits: { importContacts: 1, seenCredits: 1 },
    });
  },
  play: async ({ canvasElement }) => {
    const freeCreditsLabel =
      await within(canvasElement).findByText('free credit');

    await waitFor(() =>
      expect(freeCreditsLabel.parentElement).toHaveTextContent('1/1'),
    );
    await findVisibleTooltip(
      canvasElement,
      'Start with apps and earn 0.5 free credits',
    );
  },
};

export const NewlyEarned: Story = {
  beforeEach: () => {
    seedOnboardingFreeCredits({
      onboardingStatus: OnboardingStatus.PROFILE_CREATION,
    });
  },
  play: async ({ canvasElement }) => {
    const freeCreditsLabel =
      await within(canvasElement).findByText('free credits');

    await waitFor(() =>
      expect(freeCreditsLabel.parentElement).toHaveTextContent('0/1.5'),
    );

    jotaiStore.set(
      onboardingFreeCreditsFamilyState.atomFamily(mockCurrentWorkspace.id),
      (onboardingFreeCredits) => ({
        ...onboardingFreeCredits,
        importContacts: 1,
      }),
    );

    await within(canvasElement).findByText('+1');
    await waitFor(() =>
      expect(freeCreditsLabel.parentElement).toHaveTextContent('1/1.5'),
    );
    await waitFor(() =>
      expect(within(canvasElement).queryByText('+1')).not.toBeInTheDocument(),
    );
  },
};

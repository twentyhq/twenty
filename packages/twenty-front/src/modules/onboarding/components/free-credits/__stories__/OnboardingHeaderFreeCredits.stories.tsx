import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { onboardingConfigState } from '@/client-config/states/onboardingConfigState';
import { NumberFormat } from '@/localization/constants/NumberFormat';
import { workspaceMemberFormatPreferencesState } from '@/localization/states/workspaceMemberFormatPreferencesState';
import { OnboardingHeaderFreeCredits } from '@/onboarding/components/free-credits/OnboardingHeaderFreeCredits';
import { ONBOARDING_FREE_CREDITS_DEFAULT_VALUE } from '@/onboarding/constants/OnboardingFreeCreditsDefaultValue';
import { onboardingFreeCreditsFamilyState } from '@/onboarding/states/onboardingFreeCreditsFamilyState';
import { type OnboardingFreeCredits } from '@/onboarding/types/OnboardingFreeCredits';
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
  numberFormat = NumberFormat.COMMAS_AND_DOT,
}: {
  onboardingStatus: OnboardingStatus;
  onboardingFreeCredits?: Partial<OnboardingFreeCredits>;
  numberFormat?: NumberFormat;
}) => {
  jotaiStore.set(
    workspaceMemberFormatPreferencesState.atom,
    (formatPreferences) => ({ ...formatPreferences, numberFormat }),
  );
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

const openFreeCreditsPopover = async (
  canvasElement: HTMLElement,
  pillName: RegExp,
) => {
  await userEvent.click(
    await within(canvasElement).findByRole('button', { name: pillName }),
  );

  const dialog = await within(canvasElement.ownerDocument.body).findByRole(
    'dialog',
    { name: 'Free credits' },
  );

  await waitFor(() => expect(dialog).toBeVisible());

  return within(dialog);
};

const meta: Meta<typeof OnboardingHeaderFreeCredits> = {
  title: 'Modules/Onboarding/FreeCredits',
  component: OnboardingHeaderFreeCredits,
  decorators: [ComponentDecorator, WorkspaceDecorator],
  parameters: {
    container: { width: 360, height: 560 },
  },
};

export default meta;
type Story = StoryObj<typeof OnboardingHeaderFreeCredits>;

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

export const EarnedSoFarOnPhone: Story = {
  ...EarnedSoFar,
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
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

export const CreditsWorth: Story = {
  beforeEach: () => {
    seedOnboardingFreeCredits({
      onboardingStatus: OnboardingStatus.SYNC_EMAIL,
    });
  },
  play: async ({ canvasElement }) => {
    const popover = await openFreeCreditsPopover(canvasElement, /Earn 1/);

    await expect(
      popover.getByText('1 credit is enough for one of these on average'),
    ).toBeVisible();
    await expect(popover.getByText('Total earned')).toBeVisible();
    await expect(popover.queryByText('Breakdown')).not.toBeInTheDocument();
  },
};

export const Breakdown: Story = {
  beforeEach: () => {
    seedOnboardingFreeCredits({
      onboardingStatus: OnboardingStatus.COMPLETED,
      onboardingFreeCredits: {
        importContacts: 1,
        installApps: 0.5,
        inviteTeam: 1,
        seenCredits: 2.5,
      },
      numberFormat: NumberFormat.DOTS_AND_COMMA,
    });
  },
  play: async ({ canvasElement }) => {
    const popover = await openFreeCreditsPopover(canvasElement, /free credits/);

    await expect(popover.getByText('2,5 credits')).toBeVisible();
    await expect(
      popover.getByText('Enough for one of these on average'),
    ).toBeVisible();
    await expect(popover.getByText('60')).toBeVisible();
    await expect(popover.getByText('2,5 hours')).toBeVisible();
    await expect(popover.getByText('Create profile')).toBeVisible();
    await expect(popover.getByText('0/0,5')).toBeVisible();
    await expect(popover.getByText('Invite your team')).toBeVisible();
    await expect(popover.getByText('1/5')).toBeVisible();
  },
};

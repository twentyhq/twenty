import { type Meta, type StoryObj } from '@storybook/react-vite';
import { HttpResponse, graphql } from 'msw';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

import { currentUserState } from '@/auth/states/currentUserState';
import { OnboardingFreeCredits } from '@/onboarding/components/free-credits/OnboardingFreeCredits';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import {
  type OnboardingCreditRewards,
  OnboardingStatus,
} from '~/generated-metadata/graphql';
import { WorkspaceDecorator } from '~/testing/decorators/WorkspaceDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedUserData } from '~/testing/mock-data/users';

const buildCreditRewardsHandler = (
  creditRewards: Partial<Omit<OnboardingCreditRewards, '__typename'>>,
) =>
  graphql.query('GetOnboardingCreditRewards', () =>
    HttpResponse.json({
      data: {
        getOnboardingCreditRewards: {
          __typename: 'OnboardingCreditRewards',
          importContactsCredits: 0,
          installAppsCredits: 0,
          inviteTeamCredits: 0,
          enrichmentQualificationCredits: 0,
          totalCredits: 0,
          joinedTeammatesCount: 0,
          pendingInvitationsCount: 0,
          ...creditRewards,
        },
      },
    }),
  );

const setOnboardingStatus = (onboardingStatus: OnboardingStatus) =>
  jotaiStore.set(currentUserState.atom, {
    ...mockedUserData,
    onboardingStatus,
  });

const meta: Meta<typeof OnboardingFreeCredits> = {
  title: 'Modules/Onboarding/FreeCredits',
  component: OnboardingFreeCredits,
  decorators: [ComponentDecorator, WorkspaceDecorator],
  args: {
    onboardingConfig: {
      importContactsCreditsReward: 1,
      inviteTeamCreditsRewardPerUser: 0.5,
      installAppsCreditsRewardPerApp: 0.5,
      inviteTeamMaxInvites: 10,
    },
  },
  parameters: {
    container: { width: 360, height: 560 },
    msw: graphqlMocks,
  },
};

export default meta;
type Story = StoryObj<typeof OnboardingFreeCredits>;

export const FirstStep: Story = {
  beforeEach: () => {
    setOnboardingStatus(OnboardingStatus.SYNC_EMAIL);
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await expect(
      await body.findByText('Connect your mailbox to earn 1 free credit'),
    ).toBeVisible();

    await userEvent.click(
      await canvas.findByRole('button', { name: /Earn 1/ }),
    );

    const dialog = await body.findByRole('dialog', { name: 'Free credits' });
    await waitFor(() => expect(dialog).toBeVisible());
    const popover = within(dialog);

    await expect(
      popover.getByText('1 credit is worth on average'),
    ).toBeVisible();
    await expect(popover.getByText('Connect your email')).toBeVisible();
    await expect(popover.queryByText('Install apps')).not.toBeInTheDocument();
  },
};

export const EarnedAndPending: Story = {
  beforeEach: () => {
    setOnboardingStatus(OnboardingStatus.COMPLETED);
  },
  parameters: {
    msw: {
      handlers: [
        buildCreditRewardsHandler({
          importContactsCredits: 1,
          installAppsCredits: 1.5,
          totalCredits: 2.5,
          pendingInvitationsCount: 2,
        }),
        graphqlMocks.handlers,
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      await canvas.findByRole('button', { name: /free credits/ }),
    );

    const dialog = await body.findByRole('dialog', { name: 'Free credits' });
    await waitFor(() => expect(dialog).toBeVisible());
    const popover = within(dialog);

    await expect(popover.getByText('Worth on average')).toBeVisible();
    await expect(popover.getByText('+1.5')).toBeVisible();
    await expect(popover.getByText('2 invites pending')).toBeVisible();
  },
};

import { type Meta, type StoryObj } from '@storybook/react-vite';
import { HttpResponse, graphql } from 'msw';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

import { OnboardingFreeCredits } from '@/onboarding/components/free-credits/OnboardingFreeCredits';
import { type OnboardingCreditRewards } from '~/generated-metadata/graphql';
import { WorkspaceDecorator } from '~/testing/decorators/WorkspaceDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

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

const meta: Meta<typeof OnboardingFreeCredits> = {
  title: 'Modules/Onboarding/FreeCredits',
  component: OnboardingFreeCredits,
  decorators: [ComponentDecorator, WorkspaceDecorator],
  args: {
    onboardingConfig: {
      importContactsCreditsReward: 1,
      inviteTeamCreditsRewardPerUser: 0.5,
      installAppsCreditsRewardPerApp: 0.5,
    },
  },
  parameters: {
    container: { width: 360, height: 320 },
    msw: graphqlMocks,
  },
};

export default meta;
type Story = StoryObj<typeof OnboardingFreeCredits>;

export const NothingEarnedYet: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      await canvas.findByRole('button', { name: /Earn free credits/ }),
    );

    const dialog = await body.findByRole('dialog', { name: 'Free credits' });
    await waitFor(() => expect(dialog).toBeVisible());
    const checklist = within(dialog);

    await expect(checklist.getByText('Connect your email')).toBeVisible();
    await expect(
      checklist.getByText('+0.5 free credits per teammate who joins'),
    ).toBeVisible();
  },
};

export const EarnedAndPending: Story = {
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
      await canvas.findByRole('button', { name: /2.5 free credits/ }),
    );

    const dialog = await body.findByRole('dialog', { name: 'Free credits' });
    await waitFor(() => expect(dialog).toBeVisible());
    const checklist = within(dialog);

    await expect(checklist.getByText('+1.5')).toBeVisible();
    await expect(checklist.getByText('2 invites pending')).toBeVisible();
  },
};

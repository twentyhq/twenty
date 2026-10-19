import { type MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing/react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { GettingStartedPageContent } from '@/getting-started/components/GettingStartedPageContent';
import { GETTING_STARTED_STEPS } from '@/getting-started/constants/GettingStartedSteps';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import {
  FeatureFlagKey,
  GettingStartedProgressDocument,
  type GettingStartedProgressQuery,
  GettingStartedStep,
  SubscriptionStatus,
  UpdateGettingStartedDocument,
  UserCreditsFallback,
} from '~/generated-metadata/graphql';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';

const TRIALING_WORKSPACE = {
  ...mockCurrentWorkspace,
  featureFlags: [
    { key: FeatureFlagKey.IS_GETTING_STARTED_ENABLED, value: true },
  ],
  currentBillingSubscription: {
    ...mockCurrentWorkspace.currentBillingSubscription,
    status: SubscriptionStatus.Trialing,
    currentPeriodEnd: '2024-03-15T12:00:00.000Z',
  },
  billingCustomer: {
    id: '20202020-1c25-4d02-bf25-6aeccf7ea419',
    hasPaymentMethod: false,
    userCreditsFallback: UserCreditsFallback.STOP,
  },
};

const TRIAL_PROGRESS: GettingStartedProgressQuery['gettingStartedProgress'] = {
  __typename: 'GettingStartedProgress',
  creditsEarned: 0,
  completedSteps: [],
  selectedStep: null,
  snoozedUntil: null,
};

const meta: Meta<typeof GettingStartedPageContent> = {
  title: 'Modules/GettingStarted/GettingStartedPageContent',
  component: GettingStartedPageContent,
  decorators: [
    (Story, { parameters }) => {
      const { apolloMocks }: { apolloMocks?: MockedResponse[] } = parameters;

      return (
        <MockedProvider mocks={apolloMocks}>
          <Story />
        </MockedProvider>
      );
    },
  ],
  parameters: { layout: 'fullscreen' },
  beforeEach: () => {
    jotaiStore.set(currentWorkspaceState.atom, TRIALING_WORKSPACE);
  },
};

export default meta;

type Story = StoryObj<typeof GettingStartedPageContent>;

export const Trial: Story = {
  parameters: {
    apolloMocks: [
      {
        request: { query: GettingStartedProgressDocument },
        maxUsageCount: Infinity,
        result: { data: { gettingStartedProgress: TRIAL_PROGRESS } },
      },
      {
        request: {
          query: UpdateGettingStartedDocument,
          variables: {
            input: { selectedStep: GettingStartedStep.INVITE_TEAM },
          },
        },
        result: {
          data: {
            updateGettingStarted: {
              ...TRIAL_PROGRESS,
              selectedStep: GettingStartedStep.INVITE_TEAM,
            },
          },
        },
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('days left in your trial')).toBeVisible();
    await userEvent.click(
      within(
        await canvas.findByRole('navigation', {
          name: 'Getting started steps',
        }),
      ).getByRole('button', { name: 'Invite your team' }),
    );
    await expect(
      await canvas.findByRole('region', { name: 'Invite your team' }),
    ).toBeVisible();
  },
};

export const AllDone: Story = {
  parameters: {
    apolloMocks: [
      {
        request: { query: GettingStartedProgressDocument },
        maxUsageCount: Infinity,
        result: {
          data: {
            gettingStartedProgress: {
              ...TRIAL_PROGRESS,
              completedSteps: GETTING_STARTED_STEPS,
              selectedStep: GettingStartedStep.CONNECT_MAILBOX,
              creditsEarned: 2,
            },
          },
        },
      },
    ],
  },
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByText('All steps done'),
    ).toBeVisible();
  },
};

export const Loading: Story = {
  parameters: {
    apolloMocks: [
      {
        request: { query: GettingStartedProgressDocument },
        maxUsageCount: Infinity,
        delay: Infinity,
        result: { data: { gettingStartedProgress: TRIAL_PROGRESS } },
      },
    ],
  },
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole('status'),
    ).toBeVisible();
  },
};

export const LoadError: Story = {
  parameters: {
    apolloMocks: [
      {
        request: { query: GettingStartedProgressDocument },
        maxUsageCount: Infinity,
        error: new Error('Progress unavailable'),
      },
    ],
  },
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByText('Could not load Getting started.'),
    ).toBeVisible();
  },
};

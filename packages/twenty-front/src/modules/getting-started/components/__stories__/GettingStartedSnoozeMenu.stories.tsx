import { MockedProvider } from '@apollo/client/testing/react';
import { styled } from '@linaria/react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { billingState } from '@/client-config/states/billingState';
import { GettingStartedSnoozeMenu } from '@/getting-started/components/GettingStartedSnoozeMenu';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { themeCssVariables } from 'twenty-ui/theme';
import {
  FeatureFlagKey,
  SubscriptionStatus,
  UserCreditsFallback,
} from '~/generated-metadata/graphql';
import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import { mockedClientConfig } from '~/testing/mock-data/config';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';

const buildTrialingWorkspace = (hasPaymentMethod: boolean) => ({
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
    hasPaymentMethod,
    userCreditsFallback: UserCreditsFallback.STOP,
  },
});

const StyledHeaderFrame = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: ${themeCssVariables.spacing[4]};
  width: 480px;
`;

const meta: Meta<typeof GettingStartedSnoozeMenu> = {
  title: 'Modules/GettingStarted/GettingStartedSnoozeMenu',
  component: GettingStartedSnoozeMenu,
  decorators: [
    (Story) => (
      <StyledHeaderFrame>
        <Story />
      </StyledHeaderFrame>
    ),
    ToastDecorator,
    ComponentWithRouterDecorator,
    (Story) => (
      <MockedProvider>
        <Story />
      </MockedProvider>
    ),
  ],
  beforeEach: () => {
    jotaiStore.set(billingState.atom, mockedClientConfig.billing);
  },
};

export default meta;

type Story = StoryObj<typeof GettingStartedSnoozeMenu>;

export const WithoutPaymentMethod: Story = {
  beforeEach: () => {
    jotaiStore.set(currentWorkspaceState.atom, buildTrialingWorkspace(false));
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      await canvas.findByRole('button', { name: 'Snooze Getting started' }),
    );

    const body = within(canvasElement.ownerDocument.body);

    await expect(await body.findByText('Snooze')).toBeVisible();
    await expect(body.queryByText('Hide for good')).not.toBeInTheDocument();
  },
};

export const WithPaymentMethod: Story = {
  beforeEach: () => {
    jotaiStore.set(currentWorkspaceState.atom, buildTrialingWorkspace(true));
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      await canvas.findByRole('button', { name: 'Snooze Getting started' }),
    );

    const body = within(canvasElement.ownerDocument.body);

    await expect(await body.findByText('Snooze')).toBeVisible();
    await expect(await body.findByText('Hide for good')).toBeVisible();
  },
};

import { type MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing/react';
import { styled } from '@linaria/react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { billingState } from '@/client-config/states/billingState';
import { GettingStartedSidebarCard } from '@/getting-started/components/GettingStartedSidebarCard';
import { NAVIGATION_DRAWER_CONSTRAINTS } from '@/ui/navigation/navigation-drawer/constants/NavigationDrawerConstraints';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { themeCssVariables } from 'twenty-ui/theme';
import {
  FeatureFlagKey,
  GettingStartedProgressDocument,
  PermissionFlagType,
  SubscriptionStatus,
  UserCreditsFallback,
} from '~/generated-metadata/graphql';
import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import { mockedClientConfig } from '~/testing/mock-data/config';
import {
  mockGettingStartedStepActionKeys,
  mockGettingStartedStepDefinitions,
} from '~/testing/mock-data/gettingStartedSteps';
import {
  mockCurrentWorkspace,
  mockedUserData,
} from '~/testing/mock-data/users';

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

const PROGRESS_MOCK: MockedResponse = {
  request: { query: GettingStartedProgressDocument },
  maxUsageCount: Infinity,
  result: {
    data: {
      gettingStartedProgress: {
        __typename: 'GettingStartedProgress',
        steps: mockGettingStartedStepDefinitions,
        completedStepActionKeys: mockGettingStartedStepActionKeys.slice(0, 4),
        selectedStepActionKey: null,
        snoozedUntil: null,
        isHidden: false,
      },
    },
  },
};

const StyledDrawerFrame = styled.div`
  box-sizing: border-box;
  padding-left: ${themeCssVariables.spacing[2]};
  width: ${NAVIGATION_DRAWER_CONSTRAINTS.default}px;
`;

const meta: Meta<typeof GettingStartedSidebarCard> = {
  title: 'Modules/GettingStarted/GettingStartedSidebarCard',
  component: GettingStartedSidebarCard,
  decorators: [
    (Story) => (
      <StyledDrawerFrame>
        <Story />
      </StyledDrawerFrame>
    ),
    ToastDecorator,
    ComponentWithRouterDecorator,
    (Story) => (
      <MockedProvider mocks={[PROGRESS_MOCK]}>
        <Story />
      </MockedProvider>
    ),
  ],
  beforeEach: () => {
    jotaiStore.set(currentUserWorkspaceState.atom, {
      ...mockedUserData.currentUserWorkspace,
      permissionFlags: [PermissionFlagType.BILLING],
    });
    jotaiStore.set(billingState.atom, mockedClientConfig.billing);
    jotaiStore.set(isNavigationDrawerExpandedState.atom, true);
  },
};

export default meta;

type Story = StoryObj<typeof GettingStartedSidebarCard>;

export const WithoutPaymentMethod: Story = {
  beforeEach: () => {
    jotaiStore.set(currentWorkspaceState.atom, buildTrialingWorkspace(false));
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      await canvas.findByRole('button', { name: 'Keep Twenty' }),
    ).toBeVisible();
    await expect(
      canvas.getByRole('progressbar', { name: 'Getting started progress' }),
    ).toBeVisible();
    await expect(canvas.queryByText(/days left/)).not.toBeInTheDocument();
  },
};

export const WithPaymentMethod: Story = {
  beforeEach: () => {
    jotaiStore.set(currentWorkspaceState.atom, buildTrialingWorkspace(true));
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      await canvas.findByRole('link', { name: 'Continue setup' }),
    ).toBeVisible();
  },
};

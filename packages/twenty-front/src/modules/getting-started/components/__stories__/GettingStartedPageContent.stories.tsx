import { type MockedResponse } from '@apollo/client/testing';
import { useApolloClient } from '@apollo/client/react';
import { MockedProvider } from '@apollo/client/testing/react';
import { styled } from '@linaria/react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { billingState } from '@/client-config/states/billingState';
import { GettingStartedPageContent } from '@/getting-started/components/GettingStartedPageContent';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { isDefined } from 'twenty-shared/utils';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';
import {
  FeatureFlagKey,
  GettingStartedProgressDocument,
  type GettingStartedProgressQuery,
  GettingStartedStepActionKey,
  GettingStartedWorkflowPreviewsDocument,
  SubscriptionStatus,
  UpdateGettingStartedDocument,
  type UpdateGettingStartedMutationVariables,
  UserCreditsFallback,
  WorkflowActionType,
} from '~/generated-metadata/graphql';
import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import {
  mockGettingStartedStepDefinitions,
  mockGettingStartedStepActionKeys,
} from '~/testing/mock-data/gettingStartedSteps';
import { mockedClientConfig } from '~/testing/mock-data/config';
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
  steps: mockGettingStartedStepDefinitions,
  completedStepActionKeys: [],
  selectedStepActionKey: null,
  snoozedUntil: null,
  isHidden: false,
};

const WORKFLOW_PREVIEWS_MOCK: MockedResponse = {
  request: { query: GettingStartedWorkflowPreviewsDocument },
  maxUsageCount: Infinity,
  result: {
    data: {
      gettingStartedWorkflowPreviews: [
        {
          __typename: 'GettingStartedWorkflowPreview',
          stepActionKey: GettingStartedStepActionKey.HANDOVER_DEALS,
          trigger: {
            __typename: 'GettingStartedWorkflowPreviewTrigger',
            type: 'DATABASE_EVENT',
            databaseEventAction: 'updated',
            title: 'A deal is won',
          },
          actions: [
            {
              __typename: 'GettingStartedWorkflowPreviewAction',
              type: WorkflowActionType.CREATE_RECORD,
              title: 'Create a kickoff task',
            },
            {
              __typename: 'GettingStartedWorkflowPreviewAction',
              type: WorkflowActionType.SEND_EMAIL,
              title: 'Email the account owner',
            },
          ],
        },
      ],
    },
  },
};

const meta: Meta<typeof GettingStartedPageContent> = {
  title: 'Modules/GettingStarted/GettingStartedPageContent',
  component: GettingStartedPageContent,
  decorators: [
    ToastDecorator,
    ObjectMetadataItemsDecorator,
    ComponentWithRouterDecorator,
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
    jotaiStore.set(billingState.atom, mockedClientConfig.billing);
  },
};

export default meta;

type Story = StoryObj<typeof GettingStartedPageContent>;

export const Trial: Story = {
  parameters: {
    apolloMocks: [
      WORKFLOW_PREVIEWS_MOCK,
      {
        request: { query: GettingStartedProgressDocument },
        maxUsageCount: Infinity,
        result: { data: { gettingStartedProgress: TRIAL_PROGRESS } },
      },
      {
        request: {
          query: UpdateGettingStartedDocument,
          variables: {
            input: {
              selectedStepActionKey: GettingStartedStepActionKey.INVITE_TEAM,
            },
          },
        },
        result: {
          data: {
            updateGettingStarted: {
              ...TRIAL_PROGRESS,
              selectedStepActionKey: GettingStartedStepActionKey.INVITE_TEAM,
            },
          },
        },
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      await canvas.findByText('days left in your trial'),
    ).toBeVisible();
    await userEvent.click(
      within(
        await canvas.findByRole('navigation', {
          name: 'Getting started steps',
        }),
      ).getByRole('button', { name: 'Invite your team' }),
    );
    const inviteStepCard = await canvas.findByRole('region', {
      name: 'Invite your team',
    });

    await waitFor(() => expect(inviteStepCard).toBeVisible());
    await expect(within(inviteStepCard).queryByText(/each$/)).toBeNull();
  },
};

export const AllDone: Story = {
  parameters: {
    apolloMocks: [
      WORKFLOW_PREVIEWS_MOCK,
      {
        request: { query: GettingStartedProgressDocument },
        maxUsageCount: Infinity,
        result: {
          data: {
            gettingStartedProgress: {
              ...TRIAL_PROGRESS,
              completedStepActionKeys: mockGettingStartedStepActionKeys,
              selectedStepActionKey:
                GettingStartedStepActionKey.CONNECT_MAILBOX,
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

const createAnimationPreviewProgress =
  (): GettingStartedProgressQuery['gettingStartedProgress'] => ({
    ...TRIAL_PROGRESS,
    completedStepActionKeys: [GettingStartedStepActionKey.CONNECT_MAILBOX],
  });

let animationPreviewProgress = createAnimationPreviewProgress();

const StyledAnimationPreviewToolbar = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: center;
  padding: ${themeCssVariables.spacing[3]};
`;

const GettingStartedAnimationPreview = () => {
  const apolloClient = useApolloClient();

  const writeProgress = (
    progress: GettingStartedProgressQuery['gettingStartedProgress'],
  ) => {
    animationPreviewProgress = progress;
    apolloClient.writeQuery({
      query: GettingStartedProgressDocument,
      data: { gettingStartedProgress: progress },
    });
  };

  const completeCurrentStep = () => {
    const { steps, completedStepActionKeys, selectedStepActionKey } =
      animationPreviewProgress;
    const stepToComplete =
      isDefined(selectedStepActionKey) &&
      !completedStepActionKeys.includes(selectedStepActionKey)
        ? selectedStepActionKey
        : steps.find(
            ({ actionKey }) => !completedStepActionKeys.includes(actionKey),
          )?.actionKey;

    if (!isDefined(stepToComplete)) {
      return;
    }

    writeProgress({
      ...animationPreviewProgress,
      completedStepActionKeys: [...completedStepActionKeys, stepToComplete],
    });
  };

  return (
    <>
      <StyledAnimationPreviewToolbar>
        <Button variant="solid" color="accent" onClick={completeCurrentStep}>
          Complete the current step
        </Button>
        <Button
          variant="ghost"
          onClick={() => writeProgress(createAnimationPreviewProgress())}
        >
          Reset
        </Button>
      </StyledAnimationPreviewToolbar>
      <GettingStartedPageContent />
    </>
  );
};

export const StepAnimations: Story = {
  beforeEach: () => {
    animationPreviewProgress = createAnimationPreviewProgress();
  },
  parameters: {
    apolloMocks: [
      WORKFLOW_PREVIEWS_MOCK,
      {
        request: { query: GettingStartedProgressDocument },
        maxUsageCount: Infinity,
        result: () => ({
          data: { gettingStartedProgress: animationPreviewProgress },
        }),
      },
      {
        request: { query: UpdateGettingStartedDocument, variables: () => true },
        maxUsageCount: Infinity,
        result: ({ input }: UpdateGettingStartedMutationVariables) => {
          animationPreviewProgress = {
            ...animationPreviewProgress,
            selectedStepActionKey:
              input.selectedStepActionKey ??
              animationPreviewProgress.selectedStepActionKey,
          };

          return {
            data: { updateGettingStarted: animationPreviewProgress },
          };
        },
      },
    ],
  },
  render: () => <GettingStartedAnimationPreview />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      await canvas.findByRole('button', { name: 'Complete the current step' }),
    );

    const steps = await canvas.findByRole('navigation', {
      name: 'Getting started steps',
    });

    await waitFor(
      () =>
        expect(
          within(steps).getByRole('button', { name: 'Install an app' }),
        ).toHaveAttribute('aria-current', 'step'),
      { timeout: 3000 },
    );
  },
};

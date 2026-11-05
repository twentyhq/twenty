import { type MockedResponse } from '@apollo/client/testing';
import { useApolloClient } from '@apollo/client/react';
import { MockedProvider } from '@apollo/client/testing/react';
import { styled } from '@linaria/react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { billingState } from '@/client-config/states/billingState';
import { isGoogleMessagingEnabledState } from '@/client-config/states/isGoogleMessagingEnabledState';
import { isMicrosoftMessagingEnabledState } from '@/client-config/states/isMicrosoftMessagingEnabledState';
import { GettingStartedPageContent } from '@/getting-started/components/GettingStartedPageContent';
import { useUpdateGettingStarted } from '@/getting-started/hooks/useUpdateGettingStarted';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { GET_MY_CALENDAR_CHANNELS } from '@/settings/accounts/graphql/queries/getMyCalendarChannels';
import { GET_MY_CONNECTED_ACCOUNTS } from '@/settings/accounts/graphql/queries/getMyConnectedAccounts';
import { GET_MY_MESSAGE_CHANNELS } from '@/settings/accounts/graphql/queries/getMyMessageChannels';
import { gettingStartedJustCompletedStepState } from '@/getting-started/states/gettingStartedJustCompletedStepState';
import { getGettingStartedStepSelection } from '@/getting-started/utils/getGettingStartedStepSelection';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { TWENTY_PUBLIC_APP_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';
import { CUSTOM_WORKSPACE_APPLICATION_MOCK } from '@/object-metadata/hooks/__tests__/constants/CustomWorkspaceApplicationMock.test.constant';
import {
  FeatureFlagKey,
  FindManyMarketplaceAppsDocument,
  GettingStartedProgressDocument,
  type GettingStartedProgressQuery,
  GettingStartedStepActionKey,
  GettingStartedWorkflowPreviewsDocument,
  GetWorkspaceInvitationsDocument,
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
import { MOCKED_DATE } from '~/testing/constants/MockedDate';
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

const StyledPageFrame = styled.div`
  width: 1200px;
`;

const meta: Meta<typeof GettingStartedPageContent> = {
  title: 'Modules/GettingStarted/GettingStartedPageContent',
  component: GettingStartedPageContent,
  decorators: [
    (Story) => (
      <StyledPageFrame>
        <Story />
      </StyledPageFrame>
    ),
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
    jotaiStore.set(gettingStartedJustCompletedStepState.atom, null);
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
  },
};

export const MailboxStep: Story = {
  beforeEach: () => {
    jotaiStore.set(isGoogleMessagingEnabledState.atom, true);
    jotaiStore.set(isMicrosoftMessagingEnabledState.atom, true);

    return () => {
      jotaiStore.set(isGoogleMessagingEnabledState.atom, false);
      jotaiStore.set(isMicrosoftMessagingEnabledState.atom, false);
    };
  },
  parameters: {
    apolloMocks: [
      WORKFLOW_PREVIEWS_MOCK,
      {
        request: { query: GettingStartedProgressDocument },
        maxUsageCount: Infinity,
        result: { data: { gettingStartedProgress: TRIAL_PROGRESS } },
      },
      {
        request: { query: GET_MY_CONNECTED_ACCOUNTS },
        maxUsageCount: Infinity,
        result: { data: { myConnectedAccounts: [] } },
      },
      {
        request: { query: GET_MY_MESSAGE_CHANNELS },
        maxUsageCount: Infinity,
        result: { data: { myMessageChannels: [] } },
      },
      {
        request: { query: GET_MY_CALENDAR_CHANNELS },
        maxUsageCount: Infinity,
        result: { data: { myCalendarChannels: [] } },
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const mailboxStepCard = await canvas.findByRole('region', {
      name: 'Import your contacts',
    });

    await expect(
      await within(mailboxStepCard).findByText('Dylan Field'),
    ).toBeVisible();
    await expect(
      within(mailboxStepCard).getByText(
        'Teammates see who you talk to, not what you write.',
      ),
    ).toBeVisible();
    await expect(
      within(mailboxStepCard).getByRole('button', {
        name: 'Continue with Google',
      }),
    ).toBeVisible();
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
    const canvas = within(canvasElement);
    const mailboxStepCard = await canvas.findByRole('region', {
      name: 'Mailbox connected',
    });

    await waitFor(() => expect(mailboxStepCard).toBeVisible());
  },
};

const TWO_HOURS_BEFORE_MOCKED_DATE = new Date(
  new Date(MOCKED_DATE).getTime() - 2 * 60 * 60 * 1000,
).toISOString();

const DONE_STEP_CHAT_THREADS = [
  {
    actionKey: GettingStartedStepActionKey.IMPORT_DATA,
    chatThreadId: '20202020-8d1c-4b5e-9a3f-6c2e1b7d4f90',
    title: 'Import HubSpot contacts',
  },
  {
    actionKey: GettingStartedStepActionKey.FOLLOW_UP_DEALS,
    chatThreadId: '20202020-3a7e-4c1d-8b2f-5e9d0c6a1b47',
    title: 'Weekly deal follow-ups',
  },
];

const WORKSPACE_INVITATIONS_MOCK: MockedResponse = {
  request: { query: GetWorkspaceInvitationsDocument },
  maxUsageCount: Infinity,
  result: {
    data: {
      findWorkspaceInvitations: ['marc@acme.com', 'sam@acme.com'].map(
        (email, index) => ({
          __typename: 'WorkspaceInvitation',
          id: `20202020-0000-4000-8000-00000000010${index}`,
          email,
          roleId: null,
          expiresAt: '2024-03-20T12:00:00.000Z',
        }),
      ),
    },
  },
};

let doneStepsProgress: GettingStartedProgressQuery['gettingStartedProgress'] =
  TRIAL_PROGRESS;

const createDoneStepsProgress =
  (): GettingStartedProgressQuery['gettingStartedProgress'] => ({
    ...TRIAL_PROGRESS,
    steps: mockGettingStartedStepDefinitions.map((stepDefinition) => ({
      ...stepDefinition,
      doneChatThreadId:
        DONE_STEP_CHAT_THREADS.find(
          ({ actionKey }) => actionKey === stepDefinition.actionKey,
        )?.chatThreadId ?? null,
    })),
    completedStepActionKeys: [
      GettingStartedStepActionKey.CONNECT_MAILBOX,
      GettingStartedStepActionKey.IMPORT_DATA,
      GettingStartedStepActionKey.INSTALL_APP,
      GettingStartedStepActionKey.INVITE_TEAM,
      GettingStartedStepActionKey.FOLLOW_UP_DEALS,
    ],
    selectedStepActionKey: GettingStartedStepActionKey.INVITE_TEAM,
  });

const FEATURED_MARKETPLACE_APPS_MOCK: MockedResponse = {
  request: { query: FindManyMarketplaceAppsDocument },
  maxUsageCount: Infinity,
  result: {
    data: {
      findManyMarketplaceApps: [
        {
          id: TWENTY_PUBLIC_APP_UNIVERSAL_IDENTIFIERS.SLACK,
          name: 'Slack',
          description: 'Get notified in Slack.',
        },
        {
          id: TWENTY_PUBLIC_APP_UNIVERSAL_IDENTIFIERS.FATHOM,
          name: 'Fathom',
          description: 'Log your meeting notes.',
        },
      ].map((marketplaceApp) => ({
        __typename: 'MarketplaceApp',
        ...marketplaceApp,
        author: 'Twenty',
        category: 'Communication',
        logoUrl: null,
        sourcePackage: null,
        isListed: true,
      })),
    },
  },
};

export const DoneSteps: Story = {
  beforeEach: () => {
    doneStepsProgress = createDoneStepsProgress();
    DONE_STEP_CHAT_THREADS.forEach(({ chatThreadId, title }) =>
      jotaiStore.set(recordStoreFamilyState.atomFamily(chatThreadId), {
        __typename: 'AgentChatThread',
        id: chatThreadId,
        title,
        lastActivityAt: TWO_HOURS_BEFORE_MOCKED_DATE,
      }),
    );
    jotaiStore.set(currentWorkspaceState.atom, {
      ...TRIALING_WORKSPACE,
      installedApplications: [
        {
          ...CUSTOM_WORKSPACE_APPLICATION_MOCK,
          name: 'Slack',
          universalIdentifier: TWENTY_PUBLIC_APP_UNIVERSAL_IDENTIFIERS.SLACK,
        },
      ],
    });
  },
  parameters: {
    apolloMocks: [
      WORKFLOW_PREVIEWS_MOCK,
      FEATURED_MARKETPLACE_APPS_MOCK,
      WORKSPACE_INVITATIONS_MOCK,
      {
        request: { query: GettingStartedProgressDocument },
        maxUsageCount: Infinity,
        result: () => ({
          data: { gettingStartedProgress: doneStepsProgress },
        }),
      },
      {
        request: { query: UpdateGettingStartedDocument, variables: () => true },
        maxUsageCount: Infinity,
        result: ({ input }: UpdateGettingStartedMutationVariables) => {
          doneStepsProgress = {
            ...doneStepsProgress,
            selectedStepActionKey:
              input.selectedStepActionKey ??
              doneStepsProgress.selectedStepActionKey,
          };

          return { data: { updateGettingStarted: doneStepsProgress } };
        },
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      await canvas.findByRole('button', { name: '2 invitations sent' }),
    ).toBeVisible();
    expect(
      canvas.queryByRole('textbox', { name: 'Teammate email 1' }),
    ).not.toBeInTheDocument();

    await userEvent.click(
      canvas.getByRole('button', { name: 'Deal follow-ups on track' }),
    );

    const openThreadButton = await canvas.findByRole('button', {
      name: /Weekly deal follow-ups/,
    });

    await waitFor(() => expect(openThreadButton).toBeVisible());
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
  const { updateGettingStarted } = useUpdateGettingStarted();
  const setGettingStartedJustCompletedStep = useSetAtomState(
    gettingStartedJustCompletedStepState,
  );

  const resetProgress = () => {
    animationPreviewProgress = createAnimationPreviewProgress();
    setGettingStartedJustCompletedStep(null);
    apolloClient.writeQuery({
      query: GettingStartedProgressDocument,
      data: { gettingStartedProgress: animationPreviewProgress },
    });
  };

  const completeDisplayedStep = () => {
    const { steps, completedStepActionKeys, selectedStepActionKey } =
      animationPreviewProgress;
    const { selectedStepActionKey: displayedStepActionKey } =
      getGettingStartedStepSelection({
        stepActionKeys: steps.map(({ actionKey }) => actionKey),
        completedStepActionKeys,
        selectedStepActionKey,
      });

    void updateGettingStarted({
      completedStepActionKey: displayedStepActionKey,
    });
  };

  return (
    <>
      <StyledAnimationPreviewToolbar>
        <Button variant="solid" color="accent" onClick={completeDisplayedStep}>
          Complete the current step
        </Button>
        <Button variant="ghost" onClick={resetProgress}>
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
            completedStepActionKeys: [
              ...new Set(
                [
                  ...animationPreviewProgress.completedStepActionKeys,
                  input.completedStepActionKey,
                ].filter(isDefined),
              ),
            ],
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

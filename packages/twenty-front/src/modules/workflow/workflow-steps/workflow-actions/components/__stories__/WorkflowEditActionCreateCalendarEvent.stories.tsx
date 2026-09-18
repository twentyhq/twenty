import { type WorkflowCreateCalendarEventAction } from '@/workflow/types/Workflow';
import { WorkflowEditActionCreateCalendarEvent } from '@/workflow/workflow-steps/workflow-actions/components/WorkflowEditActionCreateCalendarEvent';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { HttpResponse, graphql } from 'msw';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ComponentDecorator, RouterDecorator } from 'twenty-ui/testing';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import { WorkflowStepActionDrawerDecorator } from '~/testing/decorators/WorkflowStepActionDrawerDecorator';
import { WorkflowStepDecorator } from '~/testing/decorators/WorkflowStepDecorator';
import { WorkspaceDecorator } from '~/testing/decorators/WorkspaceDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { getWorkflowNodeIdMock } from '~/testing/mock-data/workflow';

const MY_CONNECTED_ACCOUNT_ID = '20202020-9ac0-4390-9a1a-ab4d2c4e1bb7';
const TEAMMATE_CONNECTED_ACCOUNT_ID = '20202020-4d6e-4b1c-8f2a-3c5e7a9b1d20';

const mockedConnectedAccounts = [
  {
    id: MY_CONNECTED_ACCOUNT_ID,
    handle: 'tim@apple.dev',
    provider: 'google',
    authFailedAt: null,
    authFailedReason: null,
    archivedAt: null,
    scopes: ['https://www.googleapis.com/auth/calendar.events'],
    handleAliases: [],
    lastSignedInAt: null,
    userWorkspaceId: '20202020-0687-4c41-b707-ed1bfca972a7',
    connectionProviderId: null,
    name: 'Tim Apple',
    visibility: 'SHARE_EVERYTHING',
    lastCredentialsRefreshedAt: null,
    connectionParameters: null,
    createdAt: '2026-02-27T01:17:25.392Z',
    updatedAt: '2026-02-27T01:17:25.392Z',
  },
];

const mockedCalendarChannels = [
  {
    id: '20202020-1b3d-4f5a-9c7e-2d4f6a8b0c1e',
    handle: 'tim@apple.dev',
    visibility: 'SHARE_EVERYTHING',
    syncStatus: 'ACTIVE',
    syncStage: 'CALENDAR_EVENT_LIST_FETCH_PENDING',
    syncStageStartedAt: null,
    isContactAutoCreationEnabled: false,
    contactAutoCreationPolicy: 'NONE',
    isSyncEnabled: true,
    connectedAccountId: MY_CONNECTED_ACCOUNT_ID,
    createdAt: '2026-02-27T01:17:25.392Z',
    updatedAt: '2026-02-27T01:17:25.392Z',
  },
];

const TEAMMATE_ACCOUNT_HANDLE = {
  id: TEAMMATE_CONNECTED_ACCOUNT_ID,
  handle: 'phil@apple.dev',
  provider: 'google',
  handleAliases: [],
};

const buildMswHandlers = (
  workflowStepConnectedAccountHandle: typeof TEAMMATE_ACCOUNT_HANDLE | null,
) => [
  ...graphqlMocks.handlers,
  graphql.query('MyConnectedAccounts', () => {
    return HttpResponse.json({
      data: {
        myConnectedAccounts: mockedConnectedAccounts,
      },
    });
  }),
  graphql.query('MyMessageChannels', () => {
    return HttpResponse.json({
      data: {
        myMessageChannels: [],
      },
    });
  }),
  graphql.query('MyCalendarChannels', () => {
    return HttpResponse.json({
      data: {
        myCalendarChannels: mockedCalendarChannels,
      },
    });
  }),
  graphql.query('WorkflowStepConnectedAccountHandle', () => {
    return HttpResponse.json({
      data: {
        workflowStepConnectedAccountHandle,
      },
    });
  }),
];

const buildCreateCalendarEventAction = (
  input: Partial<WorkflowCreateCalendarEventAction['settings']['input']>,
): WorkflowCreateCalendarEventAction => ({
  id: getWorkflowNodeIdMock(),
  name: 'Create Calendar Event',
  type: 'CREATE_CALENDAR_EVENT',
  valid: true,
  settings: {
    input: {
      connectedAccountId: '',
      title: 'Quarterly review',
      description: '',
      location: '',
      startsAt: '2026-10-01T09:00:00.000Z',
      endsAt: '2026-10-01T10:00:00.000Z',
      isFullDay: false,
      timeZone: 'Europe/London',
      attendees: '',
      sendInvitations: false,
      addConferencing: false,
      ...input,
    },
    outputSchema: {},
    errorHandlingOptions: {
      retryOnFailure: {
        value: 0,
      },
      continueOnFailure: {
        value: false,
      },
    },
  },
});

const meta: Meta<typeof WorkflowEditActionCreateCalendarEvent> = {
  title: 'Modules/Workflow/Actions/CreateCalendarEvent/EditAction',
  component: WorkflowEditActionCreateCalendarEvent,
  parameters: {
    msw: {
      handlers: buildMswHandlers(TEAMMATE_ACCOUNT_HANDLE),
    },
  },
  decorators: [
    WorkflowStepActionDrawerDecorator,
    WorkflowStepDecorator,
    ComponentDecorator,
    ObjectMetadataItemsDecorator,
    ToastDecorator,
    RouterDecorator,
    WorkspaceDecorator,
  ],
};

export default meta;

type Story = StoryObj<typeof WorkflowEditActionCreateCalendarEvent>;

export const DefaultAccountAndTimeZone: Story = {
  args: {
    action: buildCreateCalendarEventAction({ timeZone: '' }),
    actionOptions: {
      onActionUpdate: fn(),
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Default account')).toBeVisible();
    expect(canvas.queryByText('tim@apple.dev')).not.toBeInTheDocument();
    expect(await canvas.findByText('Default (UTC)')).toBeVisible();
  },
};

export const TeammateAccount: Story = {
  args: {
    action: buildCreateCalendarEventAction({
      connectedAccountId: TEAMMATE_CONNECTED_ACCOUNT_ID,
    }),
    actionOptions: {
      onActionUpdate: fn(),
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('phil@apple.dev')).toBeVisible();
    expect(canvas.queryByText('tim@apple.dev')).not.toBeInTheDocument();
    expect(canvas.queryByText('Default account')).not.toBeInTheDocument();
  },
};

export const RemovedAccount: Story = {
  args: {
    action: buildCreateCalendarEventAction({
      connectedAccountId: TEAMMATE_CONNECTED_ACCOUNT_ID,
    }),
    actionOptions: {
      onActionUpdate: fn(),
    },
  },
  parameters: {
    msw: {
      handlers: buildMswHandlers(null),
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Removed account')).toBeVisible();
    expect(canvas.queryByText('Default account')).not.toBeInTheDocument();
  },
};

const clearToDefaultOnActionUpdate = fn();

export const ClearTeammateAccountToDefault: Story = {
  args: {
    action: buildCreateCalendarEventAction({
      connectedAccountId: TEAMMATE_CONNECTED_ACCOUNT_ID,
    }),
    actionOptions: {
      onActionUpdate: clearToDefaultOnActionUpdate,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(await canvas.findByText('phil@apple.dev'));

    const dropdown = within(canvasElement.ownerDocument.body);

    await userEvent.click(await dropdown.findByText('Default account'));

    expect(await canvas.findByText('Default account')).toBeVisible();
    expect(canvas.queryByText('phil@apple.dev')).not.toBeInTheDocument();

    await waitFor(
      () => {
        expect(clearToDefaultOnActionUpdate).toHaveBeenLastCalledWith(
          expect.objectContaining({
            settings: expect.objectContaining({
              input: expect.objectContaining({ connectedAccountId: '' }),
            }),
          }),
        );
      },
      { timeout: 3000 },
    );
  },
};

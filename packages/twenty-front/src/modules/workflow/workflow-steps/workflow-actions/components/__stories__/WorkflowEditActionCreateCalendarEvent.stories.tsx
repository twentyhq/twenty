import { type WorkflowCreateCalendarEventAction } from '@/workflow/types/Workflow';
import { WorkflowEditActionCreateCalendarEvent } from '@/workflow/workflow-steps/workflow-actions/components/WorkflowEditActionCreateCalendarEvent';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { HttpResponse, graphql } from 'msw';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import { WorkflowStepActionDrawerDecorator } from '~/testing/decorators/WorkflowStepActionDrawerDecorator';
import { WorkflowStepDecorator } from '~/testing/decorators/WorkflowStepDecorator';
import { WorkspaceDecorator } from '~/testing/decorators/WorkspaceDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedApolloClient } from '~/testing/mockedApolloClient';
import { mockedUserData } from '~/testing/mock-data/users';
import { getWorkflowNodeIdMock } from '~/testing/mock-data/workflow';

const DEFAULT_ACTION: WorkflowCreateCalendarEventAction = {
  id: getWorkflowNodeIdMock(),
  name: 'Create Calendar Event',
  type: 'CREATE_CALENDAR_EVENT',
  valid: false,
  settings: {
    input: {
      connectedAccountId: '',
      title: '',
      startsAt: '',
      endsAt: '',
      isFullDay: false,
      attendees: '',
      sendInvitations: true,
      addConferencing: false,
    },
    outputSchema: {},
    errorHandlingOptions: {
      retryOnFailure: { value: 0 },
      continueOnFailure: { value: false },
    },
  },
};

const meta: Meta<typeof WorkflowEditActionCreateCalendarEvent> = {
  title: 'Modules/Workflow/Actions/CreateCalendarEvent/EditAction',
  component: WorkflowEditActionCreateCalendarEvent,
  beforeEach: async () => {
    await mockedApolloClient.clearStore();
  },
  parameters: {
    msw: {
      handlers: [
        graphql.query('MyConnectedAccounts', () =>
          HttpResponse.json({ data: { myConnectedAccounts: [] } }),
        ),
        graphql.query('MyMessageChannels', () =>
          HttpResponse.json({ data: { myMessageChannels: [] } }),
        ),
        graphql.query('MyCalendarChannels', () =>
          HttpResponse.json({ data: { myCalendarChannels: [] } }),
        ),
        ...graphqlMocks.handlers,
      ],
    },
  },
  args: {
    action: DEFAULT_ACTION,
    actionOptions: { onActionUpdate: fn() },
  },
  decorators: [
    WorkflowStepActionDrawerDecorator,
    WorkflowStepDecorator,
    ComponentDecorator,
    ObjectMetadataItemsDecorator,
    ToastDecorator,
    MemoryRouterDecorator,
    WorkspaceDecorator,
  ],
};

export default meta;

type Story = StoryObj<typeof WorkflowEditActionCreateCalendarEvent>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('No Time zone')).toBeVisible();

    await userEvent.click(await canvas.findByText('No Account'));

    const dropdown = within(canvasElement.ownerDocument.body);

    expect(await dropdown.findByText('Add account')).toBeVisible();
  },
};

export const WithoutConnectedAccountsPermission: Story = {
  parameters: {
    currentUserWorkspace: {
      ...mockedUserData.currentUserWorkspace,
      permissionFlags: [],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(await canvas.findByText('No Account'));

    const dropdown = within(canvasElement.ownerDocument.body);

    expect(dropdown.queryByText('Add account')).not.toBeInTheDocument();
  },
};

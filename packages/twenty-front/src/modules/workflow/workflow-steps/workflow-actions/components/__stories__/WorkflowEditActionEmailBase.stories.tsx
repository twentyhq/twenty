import {
  type WorkflowDraftEmailAction,
  type WorkflowSendEmailAction,
} from '@/workflow/types/Workflow';
import { WorkflowEditActionEmailBase } from '@/workflow/workflow-steps/workflow-actions/components/WorkflowEditActionEmailBase';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { graphql, HttpResponse } from 'msw';
import { expect, fn, within } from 'storybook/test';
import {
  ComponentDecorator,
  RouterDecorator,
} from 'twenty-ui-deprecated/testing';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { WorkflowStepActionDrawerDecorator } from '~/testing/decorators/WorkflowStepActionDrawerDecorator';
import { WorkflowStepDecorator } from '~/testing/decorators/WorkflowStepDecorator';
import { WorkspaceDecorator } from '~/testing/decorators/WorkspaceDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { getWorkflowNodeIdMock } from '~/testing/mock-data/workflow';

const MOCK_CONNECTED_ACCOUNT_ID = '20202020-9ac0-4390-9a1a-ab4d2c4e1bb7';

const mockedConnectedAccounts = [
  {
    id: MOCK_CONNECTED_ACCOUNT_ID,
    handle: 'tim@apple.dev',
    provider: 'google',
    authFailedAt: null,
    archivedAt: null,
    scopes: ['email', 'calendar'],
    handleAliases: '',
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

const DEFAULT_SEND_EMAIL_ACTION: WorkflowSendEmailAction = {
  id: getWorkflowNodeIdMock(),
  name: 'Send Email',
  type: 'SEND_EMAIL',
  valid: false,
  settings: {
    input: {
      connectedAccountId: '',
      recipients: {
        to: '',
        cc: '',
        bcc: '',
      },
      subject: '',
      body: '',
      files: [],
      inReplyTo: '',
    },
    outputSchema: {},
    errorHandlingOptions: {
      retryOnFailure: {
        value: false,
      },
      continueOnFailure: {
        value: false,
      },
    },
  },
};

const CONFIGURED_SEND_EMAIL_ACTION: WorkflowSendEmailAction = {
  id: getWorkflowNodeIdMock(),
  name: 'Send Welcome Email',
  type: 'SEND_EMAIL',
  valid: true,
  settings: {
    input: {
      connectedAccountId: MOCK_CONNECTED_ACCOUNT_ID,
      recipients: {
        to: 'test@twenty.com',
        cc: '',
        bcc: '',
      },
      subject: 'Welcome to Twenty!',
      body: 'Dear Tim,\n\nWelcome to Twenty! We are excited to have you on board.\n\nBest regards,\nThe Team',
      files: [],
      inReplyTo: '',
    },
    outputSchema: {},
    errorHandlingOptions: {
      retryOnFailure: {
        value: true,
      },
      continueOnFailure: {
        value: false,
      },
    },
  },
};

const DEFAULT_DRAFT_EMAIL_ACTION: WorkflowDraftEmailAction = {
  id: getWorkflowNodeIdMock(),
  name: 'Draft Email',
  type: 'DRAFT_EMAIL',
  valid: false,
  settings: {
    input: {
      connectedAccountId: '',
      recipients: {
        to: '',
        cc: '',
        bcc: '',
      },
      subject: '',
      body: '',
      files: [],
      inReplyTo: '',
    },
    outputSchema: {},
    errorHandlingOptions: {
      retryOnFailure: {
        value: false,
      },
      continueOnFailure: {
        value: false,
      },
    },
  },
};

const VARIABLE_SENDER_SEND_EMAIL_ACTION: WorkflowSendEmailAction = {
  id: getWorkflowNodeIdMock(),
  name: 'Send Email',
  type: 'SEND_EMAIL',
  valid: true,
  settings: {
    input: {
      connectedAccountId: '{{trigger._metadata.workspaceMemberId}}',
      recipients: {
        to: 'test@twenty.com',
        cc: '',
        bcc: '',
      },
      subject: 'Welcome to Twenty!',
      body: 'Hello',
      files: [],
      inReplyTo: '',
    },
    outputSchema: {},
    errorHandlingOptions: {
      retryOnFailure: {
        value: false,
      },
      continueOnFailure: {
        value: false,
      },
    },
  },
};

const meta: Meta<typeof WorkflowEditActionEmailBase> = {
  title: 'Modules/Workflow/Actions/Email/EditAction',
  component: WorkflowEditActionEmailBase,
  parameters: {
    msw: {
      handlers: [
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
              myCalendarChannels: [],
            },
          });
        }),
      ],
    },
  },
  args: {
    action: DEFAULT_SEND_EMAIL_ACTION,
  },
  decorators: [
    WorkflowStepActionDrawerDecorator,
    WorkflowStepDecorator,
    ComponentDecorator,
    ObjectMetadataItemsDecorator,
    SnackBarDecorator,
    RouterDecorator,
    WorkspaceDecorator,
  ],
};

export default meta;

type Story = StoryObj<typeof WorkflowEditActionEmailBase>;

export const Default: Story = {
  args: {
    actionOptions: {
      onActionUpdate: fn(),
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Account')).toBeVisible();
    expect(await canvas.findByText('To')).toBeVisible();
    expect(await canvas.findByText('Subject')).toBeVisible();
    expect(await canvas.findByText('Body')).toBeVisible();
    expect(await canvas.findByText('Advanced options')).toBeVisible();
  },
};

export const Configured: Story = {
  args: {
    action: CONFIGURED_SEND_EMAIL_ACTION,
    actionOptions: {
      onActionUpdate: fn(),
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Account')).toBeVisible();
    expect(await canvas.findByText('To')).toBeVisible();

    const emailInput = await canvas.findByText('test@twenty.com');
    expect(emailInput).toBeVisible();

    const subjectInput = await canvas.findByText('Welcome to Twenty!');
    expect(subjectInput).toBeVisible();
  },
};

export const DraftEmail: Story = {
  args: {
    action: DEFAULT_DRAFT_EMAIL_ACTION,
    actionOptions: {
      onActionUpdate: fn(),
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Account')).toBeVisible();
    expect(await canvas.findByText('To')).toBeVisible();
    expect(await canvas.findByText('Subject')).toBeVisible();
    expect(await canvas.findByText('Body')).toBeVisible();
    expect(await canvas.findByText('Advanced options')).toBeVisible();
  },
};

export const VariableSender: Story = {
  args: {
    action: VARIABLE_SENDER_SEND_EMAIL_ACTION,
    actionOptions: {
      onActionUpdate: fn(),
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // The sender is set to a variable, so the account is rendered as a
    // removable variable chip instead of the connected-account select.
    expect(await canvas.findByText('Account')).toBeVisible();
    expect(
      await canvas.findByLabelText('Remove variable'),
    ).toBeInTheDocument();
  },
};

import {
  type WorkflowDraftEmailAction,
  type WorkflowSendEmailAction,
} from '@/workflow/types/Workflow';
import { WorkflowEditActionEmailBase } from '@/workflow/workflow-steps/workflow-actions/components/WorkflowEditActionEmailBase';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { graphql, HttpResponse } from 'msw';
import { expect, fn, within } from 'storybook/test';
import { ComponentDecorator, RouterDecorator } from 'twenty-ui/testing';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { WorkflowStepActionDrawerDecorator } from '~/testing/decorators/WorkflowStepActionDrawerDecorator';
import { WorkflowStepDecorator } from '~/testing/decorators/WorkflowStepDecorator';
import { WorkspaceDecorator } from '~/testing/decorators/WorkspaceDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import {
  getMockedConnectedAccount,
  mockedConnectedAccounts,
} from '~/testing/mock-data/connected-accounts';
import { getWorkflowNodeIdMock } from '~/testing/mock-data/workflow';

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
      connectedAccountId: mockedConnectedAccounts[0].accountOwnerId,
      recipients: {
        to: 'test@twenty.com',
        cc: '',
        bcc: '',
      },
      subject: 'Welcome to Twenty!',
      body: 'Dear Tim,\n\nWelcome to Twenty! We are excited to have you on board.\n\nBest regards,\nThe Team',
      files: [],
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
        graphql.query('FindManyConnectedAccounts', () => {
          return HttpResponse.json({
            data: {
              connectedAccounts: getMockedConnectedAccount(),
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

    const emailInput = await canvas.findByText('tim@twenty.com');
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

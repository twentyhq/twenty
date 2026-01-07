import { type WorkflowSendEmailAction } from '@/workflow/types/Workflow';
import { type Meta, type StoryObj } from '@storybook/react';
import { expect, fn, within } from '@storybook/test';
import { graphql, HttpResponse } from 'msw';
import { ComponentDecorator, RouterDecorator } from 'twenty-ui/testing';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
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
import { WorkflowEditActionSendEmail } from '@/workflow/workflow-steps/workflow-actions/components/WorkflowEditActionSendEmail';

const DEFAULT_ACTION: WorkflowSendEmailAction = {
  id: getWorkflowNodeIdMock(),
  name: 'Send Email',
  type: 'SEND_EMAIL',
  valid: false,
  settings: {
    input: {
      connectedAccountId: '',
      email: '',
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

const CONFIGURED_ACTION: WorkflowSendEmailAction = {
  id: getWorkflowNodeIdMock(),
  name: 'Send Welcome Email',
  type: 'SEND_EMAIL',
  valid: true,
  settings: {
    input: {
      connectedAccountId: mockedConnectedAccounts[0].accountOwnerId,
      email: 'test@twenty.com',
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

const meta: Meta<typeof WorkflowEditActionSendEmail> = {
  title: 'Modules/Workflow/Actions/SendEmail/EditAction',
  component: WorkflowEditActionSendEmail,
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
    action: DEFAULT_ACTION,
  },
  decorators: [
    WorkflowStepActionDrawerDecorator,
    WorkflowStepDecorator,
    ComponentDecorator,
    ObjectMetadataItemsDecorator,
    SnackBarDecorator,
    RouterDecorator,
    WorkspaceDecorator,
    I18nFrontDecorator,
  ],
};

export default meta;

type Story = StoryObj<typeof WorkflowEditActionSendEmail>;

export const Default: Story = {
  args: {
    actionOptions: {
      onActionUpdate: fn(),
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Account')).toBeVisible();
    expect(await canvas.findByText('Subject')).toBeVisible();
    expect(await canvas.findByText('Body')).toBeVisible();
  },
};

export const Configured: Story = {
  args: {
    action: CONFIGURED_ACTION,
    actionOptions: {
      onActionUpdate: fn(),
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Account')).toBeVisible();
    expect(await canvas.findByText('Subject')).toBeVisible();
    expect(await canvas.findByText('Body')).toBeVisible();

    const emailInput = await canvas.findByText('tim@twenty.com');
    expect(emailInput).toBeVisible();

    const subjectInput = await canvas.findByText('Welcome to Twenty!');
    expect(subjectInput).toBeVisible();
  },
};

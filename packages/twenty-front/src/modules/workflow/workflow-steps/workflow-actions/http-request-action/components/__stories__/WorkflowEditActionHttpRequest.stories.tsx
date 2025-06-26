import { WorkflowHttpRequestAction } from '@/workflow/types/Workflow';
import { Meta, StoryObj } from '@storybook/react';
import { expect, fn, within } from '@storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { WorkflowStepActionDrawerDecorator } from '~/testing/decorators/WorkflowStepActionDrawerDecorator';
import { WorkflowStepDecorator } from '~/testing/decorators/WorkflowStepDecorator';
import { WorkspaceDecorator } from '~/testing/decorators/WorkspaceDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { getWorkflowNodeIdMock } from '~/testing/mock-data/workflow';
import { WorkflowEditActionHttpRequest } from '../WorkflowEditActionHttpRequest';

const DEFAULT_ACTION: WorkflowHttpRequestAction = {
  id: getWorkflowNodeIdMock(),
  name: 'HTTP Request',
  type: 'HTTP_REQUEST',
  valid: false,
  settings: {
    input: {
      url: '',
      method: 'GET',
      headers: {},
      body: {},
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

const CONFIGURED_ACTION: WorkflowHttpRequestAction = {
  id: getWorkflowNodeIdMock(),
  name: 'API Call',
  type: 'HTTP_REQUEST',
  valid: true,
  settings: {
    input: {
      url: 'https://api.example.com/data',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer token123',
      },
      body: {
        name: 'Test',
        value: 123,
      },
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

const meta: Meta<typeof WorkflowEditActionHttpRequest> = {
  title: 'Modules/Workflow/WorkflowEditActionHttpRequest',
  component: WorkflowEditActionHttpRequest,
  parameters: {
    msw: graphqlMocks,
  },
  args: {
    action: DEFAULT_ACTION,
  },
  decorators: [
    WorkflowStepActionDrawerDecorator,
    WorkflowStepDecorator,
    ComponentDecorator,
    SnackBarDecorator,
    WorkspaceDecorator,
    I18nFrontDecorator,
  ],
};

export default meta;

type Story = StoryObj<typeof WorkflowEditActionHttpRequest>;

export const Default: Story = {
  args: {
    actionOptions: {
      onActionUpdate: fn(),
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('URL')).toBeVisible();
    expect(await canvas.findByText('HTTP Method')).toBeVisible();
    expect(await canvas.findByText('Headers Input')).toBeVisible();
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

    const header = await canvas.findByTestId('workflow-step-header');
    const headerCanvas = within(header);
    expect(await headerCanvas.findByText('API Call')).toBeVisible();

    const urlLabel = await canvas.findByText('URL');
    const urlInputContainer = urlLabel.closest('div')?.nextElementSibling;
    const urlEditor = urlInputContainer?.querySelector('.ProseMirror');
    expect(urlEditor).toBeVisible();
    expect(urlEditor).toHaveTextContent('https://api.example.com/data');

    expect(await canvas.findByText('POST')).toBeVisible();
    expect(await canvas.findByText('Body Input')).toBeVisible();
  },
};

export const ReadOnly: Story = {
  args: {
    action: CONFIGURED_ACTION,
    actionOptions: {
      readonly: true,
    } as const,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const urlLabel = await canvas.findByText('URL');
    const urlInputContainer = urlLabel.closest('div')?.nextElementSibling;
    const urlEditor = urlInputContainer?.querySelector('.ProseMirror');
    expect(urlEditor).toBeVisible();
    expect(urlEditor).toHaveTextContent('https://api.example.com/data');
    expect(urlEditor).toHaveAttribute('contenteditable', 'false');

    const methodSelect = await canvas.findByText('POST');
    expect(methodSelect).toBeVisible();
  },
};

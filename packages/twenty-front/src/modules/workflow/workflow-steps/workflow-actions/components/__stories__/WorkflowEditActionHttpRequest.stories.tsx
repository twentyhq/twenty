import { WorkflowHttpRequestAction } from '@/workflow/types/Workflow';
import { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';
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
      body: '',
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
      body: JSON.stringify(
        {
          name: 'Test',
          value: 123,
        },
        null,
        2,
      ),
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

    expect(await canvas.findByText('HTTP Request')).toBeVisible();
    expect(await canvas.findByText('URL')).toBeVisible();
    expect(await canvas.findByText('Method')).toBeVisible();
    expect(await canvas.findByText('Headers')).toBeVisible();
    expect(await canvas.findByText('Body')).toBeVisible();

    expect(await canvas.findByText('GET')).toBeVisible();
    expect(
      await canvas.findByPlaceholderText('https://api.example.com'),
    ).toBeVisible();
    expect(await canvas.findByPlaceholderText('{}')).toBeVisible();
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

    expect(await canvas.findByText('API Call')).toBeVisible();
    expect(
      await canvas.findByDisplayValue('https://api.example.com/data'),
    ).toBeVisible();
    expect(await canvas.findByText('POST')).toBeVisible();
    expect(
      await canvas.findByDisplayValue(
        JSON.stringify(
          {
            'Content-Type': 'application/json',
            Authorization: 'Bearer token123',
          },
          null,
          2,
        ),
      ),
    ).toBeVisible();
    expect(
      await canvas.findByDisplayValue(
        JSON.stringify(
          {
            name: 'Test',
            value: 123,
          },
          null,
          2,
        ),
      ),
    ).toBeVisible();
  },
};

export const DisabledWithEmptyValues: Story = {
  args: {
    actionOptions: {
      readonly: true,
    } as const,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const titleText = await canvas.findByText('HTTP Request');
    expect(window.getComputedStyle(titleText).cursor).toBe('default');
    await userEvent.click(titleText);
    const titleInput = canvas.queryByDisplayValue('HTTP Request');
    expect(titleInput).not.toBeInTheDocument();

    const urlInput = await canvas.findByPlaceholderText(
      'https://api.example.com',
    );
    expect(urlInput).toBeDisabled();

    const methodSelect = await canvas.findByText('GET');
    expect(methodSelect).toBeVisible();
    await userEvent.click(methodSelect);
    expect(await canvas.findByText('GET')).toBeVisible();

    const headersInput = await canvas.findByPlaceholderText('{}');
    expect(headersInput).toBeDisabled();

    const bodyInput = canvas.queryByPlaceholderText('{}');
    expect(bodyInput).not.toBeInTheDocument();
  },
};

export const DisabledWithConfiguredValues: Story = {
  args: {
    action: CONFIGURED_ACTION,
    actionOptions: {
      readonly: true,
    } as const,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const titleText = await canvas.findByText('API Call');
    expect(window.getComputedStyle(titleText).cursor).toBe('default');
    await userEvent.click(titleText);
    const titleInput = canvas.queryByDisplayValue('API Call');
    expect(titleInput).not.toBeInTheDocument();

    const urlInput = await canvas.findByDisplayValue(
      'https://api.example.com/data',
    );
    expect(urlInput).toBeDisabled();

    const methodSelect = await canvas.findByText('POST');
    expect(methodSelect).toBeVisible();
    await userEvent.click(methodSelect);
    expect(await canvas.findByText('POST')).toBeVisible();

    const headersInput = await canvas.findByDisplayValue(
      JSON.stringify(
        {
          'Content-Type': 'application/json',
          Authorization: 'Bearer token123',
        },
        null,
        2,
      ),
    );
    expect(headersInput).toBeDisabled();

    const bodyInput = await canvas.findByDisplayValue(
      JSON.stringify(
        {
          name: 'Test',
          value: 123,
        },
        null,
        2,
      ),
    );
    expect(bodyInput).toBeDisabled();
  },
};

export const InvalidJsonHeaders: Story = {
  args: {
    action: {
      ...DEFAULT_ACTION,
      settings: {
        ...DEFAULT_ACTION.settings,
        input: {
          ...DEFAULT_ACTION.settings.input,
          headers: { invalid: 'json' },
        },
      },
    },
    actionOptions: {
      onActionUpdate: fn(),
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const errorMessage = await canvas.findByText('Invalid JSON format');
    expect(errorMessage).toBeVisible();

    const headersInput = await canvas.findByDisplayValue(
      JSON.stringify({ invalid: 'json' }, null, 2),
    );
    expect(headersInput).toHaveAttribute('aria-invalid', 'true');
  },
};

export const InvalidJsonBody: Story = {
  args: {
    action: {
      ...DEFAULT_ACTION,
      settings: {
        ...DEFAULT_ACTION.settings,
        input: {
          ...DEFAULT_ACTION.settings.input,
          method: 'POST',
          body: '{invalid json}',
        },
      },
    },
    actionOptions: {
      onActionUpdate: fn(),
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const errorMessage = await canvas.findByText('Invalid JSON format');
    expect(errorMessage).toBeVisible();

    const bodyInput = await canvas.findByDisplayValue('{invalid json}');
    expect(bodyInput).toHaveAttribute('aria-invalid', 'true');
  },
};

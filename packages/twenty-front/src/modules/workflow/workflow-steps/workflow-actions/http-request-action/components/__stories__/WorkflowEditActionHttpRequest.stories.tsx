import { type WorkflowHttpRequestAction } from '@/workflow/types/Workflow';
import { type Meta, type StoryObj } from '@storybook/react';
import { expect, fn, waitFor, within } from '@storybook/test';
import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { WorkflowStepActionDrawerDecorator } from '~/testing/decorators/WorkflowStepActionDrawerDecorator';
import { WorkflowStepDecorator } from '~/testing/decorators/WorkflowStepDecorator';
import { WorkspaceDecorator } from '~/testing/decorators/WorkspaceDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import {
  getWorkflowNodeIdMock,
  MOCKED_STEP_ID,
} from '~/testing/mock-data/workflow';
import { WorkflowEditActionHttpRequest } from '@/workflow/workflow-steps/workflow-actions/http-request-action/components/WorkflowEditActionHttpRequest';

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
        'content-type': 'application/json',
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
  title: 'Modules/Workflow/Actions/HttpRequest/EditAction',
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
    ComponentWithRouterDecorator,
    SnackBarDecorator,
    WorkspaceDecorator,
    I18nFrontDecorator,
    ObjectMetadataItemsDecorator,
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

export const WithArrayStringBody: Story = {
  args: {
    action: {
      id: getWorkflowNodeIdMock(),
      name: 'API Call with Array',
      type: 'HTTP_REQUEST',
      valid: true,
      settings: {
        input: {
          url: 'https://api.example.com/tags',
          method: 'POST',
          headers: {
            'content-type': 'application/x-www-form-urlencoded',
          },
          body: `[
  "frontend",
  "backend",
  "database"
]`,
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
    } satisfies WorkflowHttpRequestAction,
    actionOptions: {
      onActionUpdate: fn(),
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Key/Value')).toBeVisible();

    expect(await canvas.findByText('0')).toBeVisible();
    expect(await canvas.findByText('1')).toBeVisible();
    expect(await canvas.findByText('2')).toBeVisible();

    expect(await canvas.findByText('frontend')).toBeVisible();
    expect(await canvas.findByText('backend')).toBeVisible();
    expect(await canvas.findByText('database')).toBeVisible();
  },
};

export const WithObjectStringBody: Story = {
  args: {
    action: {
      id: getWorkflowNodeIdMock(),
      name: 'API Call with Array',
      type: 'HTTP_REQUEST',
      valid: true,
      settings: {
        input: {
          url: 'https://api.example.com/tags',
          method: 'POST',
          headers: {
            'content-type': 'application/x-www-form-urlencoded',
          },
          body: `{
  "hey": "frontend",
  "oh": "backend",
  "amazing": "database {{${MOCKED_STEP_ID}.name}}"
}`,
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
    } satisfies WorkflowHttpRequestAction,
    actionOptions: {
      onActionUpdate: fn(),
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Key/Value')).toBeVisible();

    const textboxes = await waitFor(() => {
      const elements = canvas.getAllByRole('textbox');
      expect(elements.length).toBe(14);
      return elements;
    });

    expect(textboxes[5]).toHaveTextContent('hey');
    expect(textboxes[7]).toHaveTextContent('oh');
    expect(textboxes[9]).toHaveTextContent('amazing');

    expect(textboxes[6]).toHaveTextContent('frontend');
    expect(textboxes[8]).toHaveTextContent('backend');
    expect(textboxes[10]).toHaveTextContent('database Name');
  },
};

export const WithArrayContainingNonStringVariablesBody: Story = {
  args: {
    action: {
      id: getWorkflowNodeIdMock(),
      name: 'API Call with Array',
      type: 'HTTP_REQUEST',
      valid: true,
      settings: {
        input: {
          url: 'https://api.example.com/tags',
          method: 'POST',
          headers: {
            'content-type': 'application/json',
          },
          body: `[
  "frontend",
  {{${MOCKED_STEP_ID}.name}},
  "database"
]`,
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
    } satisfies WorkflowHttpRequestAction,
    actionOptions: {
      onActionUpdate: fn(),
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Raw JSON')).toBeVisible();

    await waitFor(() => {
      const textboxes = canvas.getAllByRole('textbox');

      expect(textboxes[5]).toHaveTextContent('[ "frontend", Name, "database"]');
    });
  },
};

export const WithObjectContainingNonStringVariablesBody: Story = {
  args: {
    action: {
      id: getWorkflowNodeIdMock(),
      name: 'API Call with Array',
      type: 'HTTP_REQUEST',
      valid: true,
      settings: {
        input: {
          url: 'https://api.example.com/tags',
          method: 'POST',
          headers: {
            'content-type': 'application/json',
          },
          body: `{
  "speciality": "frontend",
  "name": {{${MOCKED_STEP_ID}.name}}
}`,
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
    } satisfies WorkflowHttpRequestAction,
    actionOptions: {
      onActionUpdate: fn(),
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Raw JSON')).toBeVisible();

    await waitFor(() => {
      const textboxes = canvas.getAllByRole('textbox');

      expect(textboxes[5]).toHaveTextContent(
        '{ "speciality": "frontend", "name": Name}',
      );
    });
  },
};

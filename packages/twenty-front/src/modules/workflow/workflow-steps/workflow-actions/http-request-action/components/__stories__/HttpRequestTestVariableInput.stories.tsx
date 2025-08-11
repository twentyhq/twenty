import { type Meta, type StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

import { HttpRequestTestVariableInput } from '@/workflow/workflow-steps/workflow-actions/http-request-action/components/HttpRequestTestVariableInput';
import { type HttpRequestFormData } from '@/workflow/workflow-steps/workflow-actions/http-request-action/constants/HttpRequest';

const meta: Meta<typeof HttpRequestTestVariableInput> = {
  title: 'Modules/Workflow/Actions/HttpRequest/TestVariableInput',
  component: HttpRequestTestVariableInput,
  decorators: [ComponentDecorator],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof HttpRequestTestVariableInput>;

const formDataWithVariables: HttpRequestFormData = {
  url: 'https://api.example.com/users/{{user.id}}',
  method: 'POST',
  headers: {
    Authorization: 'Bearer {{auth.token}}',
    'Content-Type': 'application/json',
  },
  body: {
    name: '{{user.name}}',
    email: '{{contact.email}}',
  },
};

const formDataWithManyVariables: HttpRequestFormData = {
  url: 'https://{{api.host}}/{{api.version}}/{{endpoint.path}}',
  method: 'PUT',
  headers: {
    Authorization: 'Bearer {{auth.token}}',
    'X-User-ID': '{{user.id}}',
    'X-Request-ID': '{{request.id}}',
    'Content-Type': 'application/json',
  },
  body: {
    userData: {
      name: '{{user.name}}',
      email: '{{user.email}}',
      department: '{{user.department}}',
    },
    metadata: {
      timestamp: '{{current.timestamp}}',
      source: '{{app.name}}',
    },
  },
};

const formDataWithNoVariables: HttpRequestFormData = {
  url: 'https://api.example.com/status',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
  body: {},
};

export const WithVariables: Story = {
  args: {
    httpRequestFormData: formDataWithVariables,
    actionId: 'test-action-1',
    readonly: false,
  },

  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('user.id')).toBeVisible();
    expect(await canvas.findByText('auth.token')).toBeVisible();
    expect(await canvas.findByText('user.name')).toBeVisible();
    expect(await canvas.findByText('contact.email')).toBeVisible();

    // Should have 4 input fields
    const inputs = canvas.getAllByRole('textbox');
    expect(inputs).toHaveLength(4);
  },
};

export const WithManyVariables: Story = {
  args: {
    httpRequestFormData: formDataWithManyVariables,
    actionId: 'test-action-2',
    readonly: false,
  },

  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Should have 11 input fields
    const inputs = canvas.getAllByRole('textbox');
    expect(inputs).toHaveLength(11);

    // Check some of the variable labels
    expect(await canvas.findByText('api.host')).toBeVisible();
    expect(await canvas.findByText('user.name')).toBeVisible();
    expect(await canvas.findByText('current.timestamp')).toBeVisible();
  },
};

export const NoVariables: Story = {
  args: {
    httpRequestFormData: formDataWithNoVariables,
    actionId: 'test-action-3',
    readonly: false,
  },

  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Should not render anything when there are no variables
    // With no variables, there should be no input fields
    const inputs = canvas.queryAllByRole('textbox');
    expect(inputs).toHaveLength(0);
  },
};

export const ReadonlyMode: Story = {
  args: {
    httpRequestFormData: formDataWithVariables,
    actionId: 'test-action-4',
    readonly: true,
  },

  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // In readonly mode, variables should still be displayed
    expect(await canvas.findByText('user.id')).toBeVisible();
    expect(await canvas.findByText('auth.token')).toBeVisible();
  },
};

export const WithPrefilledValues: Story = {
  args: {
    httpRequestFormData: formDataWithVariables,
    actionId: 'test-action-5',
    readonly: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const inputs = canvas.getAllByRole('textbox');

    const userIdInput = inputs[0];
    await userEvent.type(userIdInput, '12345');

    const tokenInput = inputs[1];
    await userEvent.type(tokenInput, 'abc123xyz');

    const nameInput = inputs[2];
    await userEvent.type(nameInput, 'John Doe');
  },
};

export const SingleVariable: Story = {
  args: {
    httpRequestFormData: {
      url: 'https://api.example.com/users/{{user.id}}',
      method: 'GET',
      headers: {},
      body: {},
    },
    actionId: 'test-action-6',
    readonly: false,
  },

  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('user.id')).toBeVisible();

    // Should have only 1 input field
    const inputs = canvas.getAllByRole('textbox');
    expect(inputs).toHaveLength(1);
  },
};

export const ComplexNestedVariables: Story = {
  args: {
    httpRequestFormData: {
      url: 'https://api.example.com/{{resource.type}}/{{resource.id}}',
      method: 'PATCH',
      headers: {
        Authorization: 'Bearer {{auth.jwt}}',
        'X-Trace-ID': '{{trace.id}}',
      },
      body: {
        operation: 'update',
        data: {
          profile: {
            firstName: '{{user.profile.firstName}}',
            lastName: '{{user.profile.lastName}}',
            settings: {
              theme: '{{user.preferences.theme}}',
              notifications: '{{user.preferences.notifications}}',
            },
          },
          audit: {
            updatedBy: '{{current.user.id}}',
            updatedAt: '{{current.timestamp}}',
          },
        },
      },
    },
    actionId: 'test-action-7',
    readonly: false,
  },

  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Should have 10 input fields for all the nested variables
    const inputs = canvas.getAllByRole('textbox');
    expect(inputs).toHaveLength(10);

    // Check some complex variable paths
    expect(await canvas.findByText('user.profile.firstName')).toBeVisible();
    expect(await canvas.findByText('user.preferences.theme')).toBeVisible();
    expect(await canvas.findByText('current.timestamp')).toBeVisible();
  },
};

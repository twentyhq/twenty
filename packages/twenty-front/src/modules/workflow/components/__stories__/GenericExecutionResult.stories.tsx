import { Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

import { GenericExecutionResult } from '@/workflow/components/GenericExecutionResult';

const meta: Meta<typeof GenericExecutionResult> = {
  title: 'Modules/Workflow/Components/GenericExecutionResult',
  component: GenericExecutionResult,
  decorators: [ComponentDecorator],
  args: {
    result: JSON.stringify(
      { message: 'Hello World', status: 'success' },
      null,
      2,
    ),
    language: 'json',
    height: '300px',
    status: {
      isSuccess: false,
      isError: false,
    },
    isTesting: false,
    loadingMessage: 'Processing...',
    idleMessage: 'Output',
  },
};

export default meta;
type Story = StoryObj<typeof GenericExecutionResult>;

export const Idle: Story = {
  args: {
    status: {
      isSuccess: false,
      isError: false,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(await canvas.findByText('Output')).toBeVisible();
  },
};

export const Success: Story = {
  args: {
    status: {
      isSuccess: true,
      isError: false,
      successMessage: '200 OK - 156ms',
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(await canvas.findByText('200 OK - 156ms')).toBeVisible();
  },
};

export const SuccessWithAdditionalInfo: Story = {
  args: {
    status: {
      isSuccess: true,
      isError: false,
      successMessage: '200 OK - 156ms',
      additionalInfo: '5 headers received',
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(await canvas.findByText('200 OK - 156ms')).toBeVisible();
    expect(await canvas.findByText('5 headers received')).toBeVisible();
  },
};

export const Error: Story = {
  args: {
    result: JSON.stringify(
      { error: 'Internal Server Error', code: 500 },
      null,
      2,
    ),
    status: {
      isSuccess: false,
      isError: true,
      errorMessage: '500 Internal Server Error - 89ms',
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(
      await canvas.findByText('500 Internal Server Error - 89ms'),
    ).toBeVisible();
  },
};

export const ErrorWithAdditionalInfo: Story = {
  args: {
    result: 'Connection timeout',
    language: 'plaintext',
    status: {
      isSuccess: false,
      isError: true,
      errorMessage: 'Request Failed',
      additionalInfo: 'Connection timeout after 30 seconds',
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(await canvas.findByText('Request Failed')).toBeVisible();
    expect(
      await canvas.findByText('Connection timeout after 30 seconds'),
    ).toBeVisible();
  },
};

export const Loading: Story = {
  args: {
    isTesting: true,
    loadingMessage: 'Executing function...',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(await canvas.findByText('Executing function...')).toBeVisible();
  },
};

export const CustomIdleMessage: Story = {
  args: {
    idleMessage: 'Response will appear here',
    status: {
      isSuccess: false,
      isError: false,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(await canvas.findByText('Response will appear here')).toBeVisible();
  },
};

export const PlaintextContent: Story = {
  args: {
    result:
      'This is plain text content\nwith multiple lines\nand no JSON formatting',
    language: 'plaintext',
    status: {
      isSuccess: true,
      isError: false,
      successMessage: 'Text processed successfully',
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(
      await canvas.findByText('Text processed successfully'),
    ).toBeVisible();
  },
};

export const LargeResult: Story = {
  args: {
    result: JSON.stringify(
      {
        users: Array.from({ length: 20 }, (_, i) => ({
          id: i + 1,
          name: `User ${i + 1}`,
          email: `user${i + 1}@example.com`,
          active: i % 2 === 0,
          metadata: {
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            permissions: ['read', 'write'],
          },
        })),
        totalCount: 20,
        page: 1,
        limit: 20,
      },
      null,
      2,
    ),
    language: 'json',
    height: '400px',
    status: {
      isSuccess: true,
      isError: false,
      successMessage: '200 OK - 234ms',
      additionalInfo: '20 users retrieved',
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(await canvas.findByText('200 OK - 234ms')).toBeVisible();
    expect(await canvas.findByText('20 users retrieved')).toBeVisible();
  },
};

export const EmptyResult: Story = {
  args: {
    result: '',
    status: {
      isSuccess: true,
      isError: false,
      successMessage: '204 No Content - 45ms',
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(await canvas.findByText('204 No Content - 45ms')).toBeVisible();
  },
};

export const HttpRequestResponse: Story = {
  args: {
    result: JSON.stringify(
      {
        id: '12345',
        name: 'Acme Corp',
        industry: 'Technology',
        employees: 150,
        founded: 2010,
        headquarters: {
          city: 'San Francisco',
          state: 'CA',
          country: 'USA',
        },
        revenue: '$50M',
        isPublic: false,
      },
      null,
      2,
    ),
    language: 'json',
    status: {
      isSuccess: true,
      isError: false,
      successMessage: '200 OK - 123ms',
      additionalInfo: '8 headers received',
    },
    idleMessage: 'Response',
    loadingMessage: 'Sending request...',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(await canvas.findByText('200 OK - 123ms')).toBeVisible();
    expect(await canvas.findByText('8 headers received')).toBeVisible();
  },
};

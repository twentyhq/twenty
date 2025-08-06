import { Meta, StoryObj } from '@storybook/react';
import { ComponentDecorator } from 'twenty-ui/testing';

import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';

import { WorkflowExecutionResult } from '@/workflow/components/WorkflowExecutionResult';

const meta: Meta<typeof WorkflowExecutionResult> = {
  title: 'Modules/Workflow/Components/ExecutionResult',
  component: WorkflowExecutionResult,
  decorators: [ComponentDecorator, SnackBarDecorator, I18nFrontDecorator],
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
type Story = StoryObj<typeof WorkflowExecutionResult>;

export const Idle: Story = {
  args: {
    status: {
      isSuccess: false,
      isError: false,
    },
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
};

export const Loading: Story = {
  args: {
    isTesting: true,
    loadingMessage: 'Executing function...',
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
};

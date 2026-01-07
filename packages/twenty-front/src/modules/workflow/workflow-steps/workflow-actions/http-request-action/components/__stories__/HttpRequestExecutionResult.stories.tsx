import { type Meta, type StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';

import { HttpRequestExecutionResult } from '@/workflow/workflow-steps/workflow-actions/http-request-action/components/HttpRequestExecutionResult';
import type { HttpRequestTestData } from '@/workflow/workflow-steps/workflow-actions/http-request-action/types/HttpRequestTestData';

const meta: Meta<typeof HttpRequestExecutionResult> = {
  title: 'Modules/Workflow/Actions/HttpRequest/ExecutionResult',
  component: HttpRequestExecutionResult,
  decorators: [ComponentDecorator, SnackBarDecorator, I18nFrontDecorator],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof HttpRequestExecutionResult>;

const successTestData: HttpRequestTestData = {
  variableValues: {},
  output: {
    data: JSON.stringify(
      {
        id: '12345',
        name: 'Acme Corp',
        industry: 'Technology',
        employees: 150,
        revenue: '$50M',
        isActive: true,
      },
      null,
      2,
    ),
    status: 200,
    statusText: 'OK',
    headers: {
      'content-type': 'application/json',
      'x-rate-limit-remaining': '99',
      'cache-control': 'no-cache',
    },
    duration: 156,
  },
  language: 'json',
  height: 300,
};

export const Success: Story = {
  args: {
    httpRequestTestData: successTestData,
    isTesting: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(await canvas.findByText('200 OK - 156ms')).toBeVisible();
    expect(await canvas.findByText('3 headers received')).toBeVisible();
  },
};

export const SuccessNoHeaders: Story = {
  args: {
    httpRequestTestData: {
      ...successTestData,
      output: {
        ...successTestData.output,
        headers: {},
      },
    },
    isTesting: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(await canvas.findByText('200 OK - 156ms')).toBeVisible();
  },
};

export const Created: Story = {
  args: {
    httpRequestTestData: {
      ...successTestData,
      output: {
        data: JSON.stringify(
          { id: '67890', message: 'Resource created successfully' },
          null,
          2,
        ),
        status: 201,
        statusText: 'Created',
        headers: {
          'content-type': 'application/json',
          location: '/api/resources/67890',
        },
        duration: 234,
      },
    },
    isTesting: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(await canvas.findByText('201 Created - 234ms')).toBeVisible();
    expect(await canvas.findByText('2 headers received')).toBeVisible();
  },
};

export const NoContent: Story = {
  args: {
    httpRequestTestData: {
      ...successTestData,
      output: {
        data: '',
        status: 204,
        statusText: 'No Content',
        headers: {},
        duration: 45,
      },
    },
    isTesting: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(await canvas.findByText('204 No Content - 45ms')).toBeVisible();
  },
};

export const BadRequest: Story = {
  args: {
    httpRequestTestData: {
      ...successTestData,
      output: {
        data: JSON.stringify(
          {
            error: 'Bad Request',
            message: 'Invalid request parameters',
            details: [
              'Field "name" is required',
              'Field "email" must be valid',
            ],
          },
          null,
          2,
        ),
        status: 400,
        statusText: 'Bad Request',
        headers: {
          'content-type': 'application/json',
        },
        duration: 67,
      },
    },
    isTesting: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(await canvas.findByText('400 Bad Request - 67ms')).toBeVisible();
  },
};

export const NotFound: Story = {
  args: {
    httpRequestTestData: {
      ...successTestData,
      output: {
        data: JSON.stringify(
          {
            error: 'Not Found',
            message: 'The requested resource was not found',
          },
          null,
          2,
        ),
        status: 404,
        statusText: 'Not Found',
        headers: {
          'content-type': 'application/json',
        },
        duration: 89,
      },
    },
    isTesting: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(await canvas.findByText('404 Not Found - 89ms')).toBeVisible();
  },
};

export const InternalServerError: Story = {
  args: {
    httpRequestTestData: {
      ...successTestData,
      output: {
        data: JSON.stringify(
          {
            error: 'Internal Server Error',
            message: 'An unexpected error occurred',
            timestamp: '2023-12-07T10:30:00Z',
          },
          null,
          2,
        ),
        status: 500,
        statusText: 'Internal Server Error',
        headers: {
          'content-type': 'application/json',
        },
        duration: 2345,
      },
    },
    isTesting: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(
      await canvas.findByText('500 Internal Server Error - 2345ms'),
    ).toBeVisible();
  },
};

export const NetworkError: Story = {
  args: {
    httpRequestTestData: {
      ...successTestData,
      output: {
        error: 'Network connection failed: timeout after 30 seconds',
        headers: {},
        duration: 30000,
      },
    },
    isTesting: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(await canvas.findByText('Request Failed')).toBeVisible();
    expect(await canvas.findByText('An error occurred')).toBeVisible();

    const codeEditorValue = await canvas.findByTestId('code-editor-value');
    expect(codeEditorValue).toHaveValue(
      'Network connection failed: timeout after 30 seconds',
    );
  },
};

export const Loading: Story = {
  args: {
    httpRequestTestData: {
      ...successTestData,
      output: {
        data: 'Configure your request above, then press "Test"',
        headers: {},
      },
    },
    isTesting: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(await canvas.findByText('Sending request...')).toBeVisible();
  },
};

export const PlaintextResponse: Story = {
  args: {
    httpRequestTestData: {
      ...successTestData,
      output: {
        data: 'Hello World!\nThis is a plain text response from the server.\nIt contains multiple lines of text.',
        status: 200,
        statusText: 'OK',
        headers: {
          'content-type': 'text/plain',
        },
        duration: 78,
      },
      language: 'plaintext',
    },
    isTesting: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(await canvas.findByText('200 OK - 78ms')).toBeVisible();
  },
};

export const LargeResponse: Story = {
  args: {
    httpRequestTestData: {
      ...successTestData,
      output: {
        data: JSON.stringify(
          {
            users: Array.from({ length: 50 }, (_, i) => ({
              id: i + 1,
              name: `User ${i + 1}`,
              email: `user${i + 1}@example.com`,
              active: i % 2 === 0,
              profile: {
                firstName: `First${i + 1}`,
                lastName: `Last${i + 1}`,
                company: `Company ${Math.floor(i / 10) + 1}`,
                position: ['Developer', 'Designer', 'Manager', 'Analyst'][
                  i % 4
                ],
              },
              metadata: {
                createdAt: new Date(2023, 0, 1 + i).toISOString(),
                lastLogin: new Date(2023, 11, 1 + (i % 30)).toISOString(),
                permissions: ['read', 'write', 'admin'].slice(0, (i % 3) + 1),
              },
            })),
            pagination: {
              totalCount: 500,
              page: 1,
              totalPages: 10,
            },
          },
          null,
          2,
        ),
        status: 200,
        statusText: 'OK',
        headers: {
          'content-type': 'application/json',
          'x-total-count': '500',
          'x-rate-limit-remaining': '98',
          'cache-control': 'public, max-age=300',
        },
        duration: 567,
      },
      height: 500,
    },
    isTesting: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(await canvas.findByText('200 OK - 567ms')).toBeVisible();
    expect(await canvas.findByText('4 headers received')).toBeVisible();
  },
};

export const Unauthorized: Story = {
  args: {
    httpRequestTestData: {
      ...successTestData,
      output: {
        data: JSON.stringify(
          {
            error: 'Unauthorized',
            message: 'Authentication credentials are missing or invalid',
          },
          null,
          2,
        ),
        status: 401,
        statusText: 'Unauthorized',
        headers: {
          'content-type': 'application/json',
          'www-authenticate': 'Bearer',
        },
        duration: 123,
      },
    },
    isTesting: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(await canvas.findByText('401 Unauthorized - 123ms')).toBeVisible();
  },
};

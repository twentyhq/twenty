import { type WorkflowCodeAction } from '@/workflow/types/Workflow';
import { WorkflowEditActionServerlessFunction } from '@/workflow/workflow-steps/workflow-actions/code-action/components/WorkflowEditActionServerlessFunction';
import { type Meta, type StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { graphql, HttpResponse } from 'msw';
import { ComponentDecorator, RouterDecorator } from 'twenty-ui/testing';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { WorkflowStepActionDrawerDecorator } from '~/testing/decorators/WorkflowStepActionDrawerDecorator';
import { WorkflowStepDecorator } from '~/testing/decorators/WorkflowStepDecorator';
import { WorkspaceDecorator } from '~/testing/decorators/WorkspaceDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { getWorkflowNodeIdMock } from '~/testing/mock-data/workflow';

const DEFAULT_ACTION: WorkflowCodeAction = {
  id: getWorkflowNodeIdMock(),
  name: 'Code',
  type: 'CODE',
  valid: false,
  settings: {
    input: {
      serverlessFunctionId: '',
      serverlessFunctionVersion: 'draft',
      serverlessFunctionInput: {},
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

const CONFIGURED_ACTION: WorkflowCodeAction = {
  id: getWorkflowNodeIdMock(),
  name: 'Process Data',
  type: 'CODE',
  valid: true,
  settings: {
    input: {
      serverlessFunctionId: 'test-function-id',
      serverlessFunctionVersion: 'draft',
      serverlessFunctionInput: {
        name: 'John Doe',
        email: 'john@example.com',
        score: 95,
      },
    },
    outputSchema: {
      result: {
        type: 'TEXT',
        label: 'Result',
        value: 'Processing completed',
        isLeaf: true,
      },
      status: {
        type: 'TEXT',
        label: 'Status',
        value: 'success',
        isLeaf: true,
      },
    },
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

const meta: Meta<typeof WorkflowEditActionServerlessFunction> = {
  title: 'Modules/Workflow/Actions/Code/EditAction',
  component: WorkflowEditActionServerlessFunction,
  parameters: {
    msw: {
      handlers: [
        ...graphqlMocks.handlers,
        graphql.query('FindManyServerlessFunctions', () => {
          return HttpResponse.json({
            data: {
              findManyServerlessFunctions: [
                {
                  id: 'test-function-id',
                  name: 'Test Function',
                  description: 'A test serverless function',
                  runtime: 'nodejs22.x',
                  createdAt: '2024-01-01T00:00:00.000Z',
                  updatedAt: '2024-01-01T00:00:00.000Z',
                },
              ],
            },
          });
        }),
        graphql.query('FindOneServerlessFunction', () => {
          return HttpResponse.json({
            data: {
              findOneServerlessFunction: {
                id: 'test-function-id',
                name: 'Test Function',
                description: 'A test serverless function',
                runtime: 'nodejs22.x',
                createdAt: '2024-01-01T00:00:00.000Z',
                updatedAt: '2024-01-01T00:00:00.000Z',
              },
            },
          });
        }),
        graphql.query('FindManyAvailablePackages', () => {
          return HttpResponse.json({
            data: {
              getAvailablePackages: ['axios', 'lodash', 'moment'],
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

type Story = StoryObj<typeof WorkflowEditActionServerlessFunction>;

export const Default: Story = {
  args: {
    actionOptions: {
      onActionUpdate: fn(),
    },
  },
};

export const Configured: Story = {
  args: {
    action: CONFIGURED_ACTION,
    actionOptions: {
      onActionUpdate: fn(),
    },
  },
};

export const ReadOnly: Story = {
  args: {
    action: CONFIGURED_ACTION,
    actionOptions: {
      readonly: true,
    },
  },
};

export const WithTestResults: Story = {
  args: {
    action: {
      ...CONFIGURED_ACTION,
      settings: {
        ...CONFIGURED_ACTION.settings,
        outputSchema: {
          result: {
            type: 'TEXT',
            label: 'Processing Result',
            value: 'Successfully processed 150 records',
            isLeaf: true,
          },
          executionTime: {
            type: 'NUMBER',
            label: 'Execution Time (ms)',
            value: 245,
            isLeaf: true,
          },
          errors: {
            type: 'ARRAY',
            label: 'Errors',
            value: [],
            isLeaf: true,
          },
        },
      },
    },
    actionOptions: {
      onActionUpdate: fn(),
    },
  },
};

export const EmptyFunction: Story = {
  args: {
    action: {
      ...DEFAULT_ACTION,
      settings: {
        ...DEFAULT_ACTION.settings,
        input: {
          serverlessFunctionId: '',
          serverlessFunctionVersion: 'draft',
          serverlessFunctionInput: {},
        },
      },
    },
    actionOptions: {
      onActionUpdate: fn(),
    },
  },
};

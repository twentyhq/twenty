import { type WorkflowCodeAction } from '@/workflow/types/Workflow';
import { WorkflowEditActionLogicFunction } from '@/workflow/workflow-steps/workflow-actions/code-action/components/WorkflowEditActionLogicFunction';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { graphql, HttpResponse } from 'msw';
import { fn } from 'storybook/test';
import { ComponentDecorator, RouterDecorator } from 'twenty-ui/testing';
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
      logicFunctionId: '',
      logicFunctionVersion: 'draft',
      logicFunctionInput: {},
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
      logicFunctionId: 'test-function-id',
      logicFunctionVersion: 'draft',
      logicFunctionInput: {
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

const meta: Meta<typeof WorkflowEditActionLogicFunction> = {
  title: 'Modules/Workflow/Actions/Code/EditAction',
  component: WorkflowEditActionLogicFunction,
  parameters: {
    msw: {
      handlers: [
        ...graphqlMocks.handlers,
        graphql.query('GetManyLogicFunctions', () => {
          return HttpResponse.json({
            data: {
              findManyLogicFunctions: [
                {
                  id: 'test-function-id',
                  name: 'Test Function',
                  description: 'A test logic function',
                  runtime: 'nodejs22.x',
                  createdAt: '2024-01-01T00:00:00.000Z',
                  updatedAt: '2024-01-01T00:00:00.000Z',
                },
              ],
            },
          });
        }),
        graphql.query('GetOneLogicFunction', () => {
          return HttpResponse.json({
            data: {
              findOneLogicFunction: {
                id: 'test-function-id',
                name: 'Test Function',
                description: 'A test logic function',
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
  ],
};

export default meta;

type Story = StoryObj<typeof WorkflowEditActionLogicFunction>;

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
          logicFunctionId: '',
          logicFunctionVersion: 'draft',
          logicFunctionInput: {},
        },
      },
    },
    actionOptions: {
      onActionUpdate: fn(),
    },
  },
};

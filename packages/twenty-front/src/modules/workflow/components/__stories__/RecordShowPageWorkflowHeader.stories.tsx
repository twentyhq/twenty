import { Meta, StoryObj } from '@storybook/react';
import { graphql, HttpResponse } from 'msw';
import { ComponentDecorator } from 'twenty-ui';

import { RecordShowPageWorkflowHeader } from '@/workflow/components/RecordShowPageWorkflowHeader';
import { expect, within } from '@storybook/test';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

const meta: Meta<typeof RecordShowPageWorkflowHeader> = {
  title: 'Modules/Workflow/RecordShowPageWorkflowHeader',
  component: RecordShowPageWorkflowHeader,
  decorators: [
    ComponentDecorator,
    ObjectMetadataItemsDecorator,
    SnackBarDecorator,
  ],
  parameters: {
    container: { width: 728 },
  },
};

export default meta;
type Story = StoryObj<typeof RecordShowPageWorkflowHeader>;

const blankInitialVersionWorkflowId = '78fd5184-08f4-47b7-bb60-adb541608f65';

export const BlankInitialVersion: Story = {
  args: {
    workflowId: blankInitialVersionWorkflowId,
  },
  parameters: {
    msw: {
      handlers: [
        graphql.query('FindOneWorkflow', () => {
          return HttpResponse.json({
            data: {
              workflow: {
                __typename: 'Workflow',
                id: blankInitialVersionWorkflowId,
                name: '1231 qqerrt',
                statuses: null,
                lastPublishedVersionId: '',
                deletedAt: null,
                updatedAt: '2024-09-19T10:10:04.505Z',
                position: 0,
                createdAt: '2024-09-19T10:10:04.505Z',
                favorites: {
                  __typename: 'FavoriteConnection',
                  edges: [],
                },
                eventListeners: {
                  __typename: 'WorkflowEventListenerConnection',
                  edges: [],
                },
                runs: {
                  __typename: 'WorkflowRunConnection',
                  edges: [],
                },
                versions: {
                  __typename: 'WorkflowVersionConnection',
                  edges: [
                    {
                      __typename: 'WorkflowVersionEdge',
                      node: {
                        __typename: 'WorkflowVersion',
                        updatedAt: '2024-09-19T10:13:12.075Z',
                        steps: null,
                        createdAt: '2024-09-19T10:10:04.725Z',
                        status: 'DRAFT',
                        name: 'v1',
                        id: 'f618843a-26be-4a54-a60f-f4ce88a594f0',
                        trigger: null,
                        deletedAt: null,
                        workflowId: blankInitialVersionWorkflowId,
                      },
                    },
                  ],
                },
              },
            },
          });
        }),
        ...graphqlMocks.handlers,
      ],
    },
  },
  play: async () => {
    const canvas = within(document.body);

    expect(await canvas.findByText('Test')).toBeVisible();
    expect(await canvas.findByText('Activate')).toBeVisible();
    expect(canvas.queryByText('Discard Draft')).not.toBeInTheDocument();
  },
};

const activeVersionWorkflowId = 'ca177fb1-7780-4911-8b1f-ef0a245fbd61';

export const ActiveVersion: Story = {
  args: {
    workflowId: activeVersionWorkflowId,
  },
  parameters: {
    msw: {
      handlers: [
        graphql.query('FindOneWorkflow', () => {
          return HttpResponse.json({
            data: {
              workflow: {
                __typename: 'Workflow',
                id: blankInitialVersionWorkflowId,
                name: '1231 qqerrt',
                statuses: null,
                lastPublishedVersionId: '',
                deletedAt: null,
                updatedAt: '2024-09-19T10:10:04.505Z',
                position: 0,
                createdAt: '2024-09-19T10:10:04.505Z',
                favorites: {
                  __typename: 'FavoriteConnection',
                  edges: [],
                },
                eventListeners: {
                  __typename: 'WorkflowEventListenerConnection',
                  edges: [],
                },
                runs: {
                  __typename: 'WorkflowRunConnection',
                  edges: [],
                },
                versions: {
                  __typename: 'WorkflowVersionConnection',
                  edges: [
                    {
                      __typename: 'WorkflowVersionEdge',
                      node: {
                        __typename: 'WorkflowVersion',
                        updatedAt: '2024-09-19T10:13:12.075Z',
                        steps: null,
                        createdAt: '2024-09-19T10:10:04.725Z',
                        status: 'ACTIVE',
                        name: 'v1',
                        id: 'f618843a-26be-4a54-a60f-f4ce88a594f0',
                        trigger: null,
                        deletedAt: null,
                        workflowId: blankInitialVersionWorkflowId,
                      },
                    },
                  ],
                },
              },
            },
          });
        }),
        ...graphqlMocks.handlers,
      ],
    },
  },
  play: async () => {
    const canvas = within(document.body);

    expect(await canvas.findByText('Test')).toBeVisible();
    expect(await canvas.findByText('Deactivate')).toBeVisible();
  },
};

const draftVersionWithPreviousActiveVersionWorkflowId =
  '89c00f14-4ebd-4675-a098-cdf59eee372b';

export const DraftVersionWithPreviousActiveVersion: Story = {
  args: {
    workflowId: draftVersionWithPreviousActiveVersionWorkflowId,
  },
  parameters: {
    msw: {
      handlers: [
        graphql.query('FindOneWorkflow', () => {
          return HttpResponse.json({
            data: {
              workflow: {
                __typename: 'Workflow',
                id: draftVersionWithPreviousActiveVersionWorkflowId,
                name: '1231 qqerrt',
                statuses: null,
                lastPublishedVersionId: '',
                deletedAt: null,
                updatedAt: '2024-09-19T10:10:04.505Z',
                position: 0,
                createdAt: '2024-09-19T10:10:04.505Z',
                favorites: {
                  __typename: 'FavoriteConnection',
                  edges: [],
                },
                eventListeners: {
                  __typename: 'WorkflowEventListenerConnection',
                  edges: [],
                },
                runs: {
                  __typename: 'WorkflowRunConnection',
                  edges: [],
                },
                versions: {
                  __typename: 'WorkflowVersionConnection',
                  edges: [
                    {
                      __typename: 'WorkflowVersionEdge',
                      node: {
                        __typename: 'WorkflowVersion',
                        updatedAt: '2024-09-19T10:13:12.075Z',
                        steps: null,
                        createdAt: '2024-09-19T10:10:04.725Z',
                        status: 'ACTIVE',
                        name: 'v1',
                        id: 'f618843a-26be-4a54-a60f-f4ce88a594f0',
                        trigger: null,
                        deletedAt: null,
                        workflowId:
                          draftVersionWithPreviousActiveVersionWorkflowId,
                      },
                    },
                    {
                      __typename: 'WorkflowVersionEdge',
                      node: {
                        __typename: 'WorkflowVersion',
                        updatedAt: '2024-09-19T10:13:12.075Z',
                        steps: null,
                        createdAt: '2024-09-19T10:10:05.725Z',
                        status: 'DRAFT',
                        name: 'v2',
                        id: 'f618843a-26be-4a54-a60f-f4ce88a594f1',
                        trigger: null,
                        deletedAt: null,
                        workflowId:
                          draftVersionWithPreviousActiveVersionWorkflowId,
                      },
                    },
                  ],
                },
              },
            },
          });
        }),
        ...graphqlMocks.handlers,
      ],
    },
  },
  play: async () => {
    const canvas = within(document.body);

    expect(await canvas.findByText('Test')).toBeVisible();
    expect(await canvas.findByText('Discard Draft')).toBeVisible();
  },
};

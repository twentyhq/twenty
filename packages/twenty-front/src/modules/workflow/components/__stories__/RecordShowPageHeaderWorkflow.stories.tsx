import { Meta, StoryObj } from '@storybook/react';
import { graphql, HttpResponse } from 'msw';
import { ComponentDecorator } from 'twenty-ui';

import { Calendar } from '@/activities/calendar/components/Calendar';
import { RecordShowPageHeaderWorkflow } from '@/workflow/components/RecordShowPageHeaderWorkflow';
import { expect, within } from '@storybook/test';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

const meta: Meta<typeof RecordShowPageHeaderWorkflow> = {
  title: 'Modules/Workflow/RecordShowPageHeaderWorkflow',
  component: RecordShowPageHeaderWorkflow,
  decorators: [
    ComponentDecorator,
    ObjectMetadataItemsDecorator,
    SnackBarDecorator,
  ],
  parameters: {
    container: { width: 728 },
    msw: {
      handlers: [...graphqlMocks.handlers],
    },
  },
  args: {
    workflowId: '200c1508-f102-4bb9-af32-eda55239ae61',
  },
};

export default meta;
type Story = StoryObj<typeof Calendar>;

export const BlankInitialVersion: Story = {
  parameters: {
    msw: {
      handlers: [
        graphql.query('FindManyWorkflows', () => {
          return HttpResponse.json({
            data: {
              workflows: {
                __typename: 'WorkflowConnection',
                totalCount: 1,
                pageInfo: {
                  __typename: 'PageInfo',
                  hasNextPage: false,
                  hasPreviousPage: false,
                  startCursor:
                    'eyJpZCI6IjIwMGMxNTA4LWYxMDItNGJiOS1hZjMyLWVkYTU1MjM5YWU2MSJ9',
                  endCursor:
                    'eyJpZCI6IjIwMGMxNTA4LWYxMDItNGJiOS1hZjMyLWVkYTU1MjM5YWU2MSJ9',
                },
                edges: [
                  {
                    __typename: 'WorkflowEdge',
                    cursor:
                      'eyJpZCI6IjIwMGMxNTA4LWYxMDItNGJiOS1hZjMyLWVkYTU1MjM5YWU2MSJ9',
                    node: {
                      __typename: 'Workflow',
                      id: '200c1508-f102-4bb9-af32-eda55239ae61',
                    },
                  },
                ],
              },
            },
          });
        }),
        graphql.query('FindOneWorkflow', () => {
          return HttpResponse.json({
            data: {
              workflow: {
                __typename: 'Workflow',
                id: '200c1508-f102-4bb9-af32-eda55239ae61',
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
                        workflowId: '200c1508-f102-4bb9-af32-eda55239ae61',
                      },
                    },
                  ],
                },
              },
            },
          });
        }),
        graphql.query('FindManyWorkflowVersions', () => {
          return HttpResponse.json({
            data: {
              workflowVersions: {
                __typename: 'WorkflowVersionConnection',
                totalCount: 1,
                pageInfo: {
                  __typename: 'PageInfo',
                  hasNextPage: false,
                  hasPreviousPage: false,
                  startCursor:
                    'eyJjcmVhdGVkQXQiOiIyMDI0LTA5LTE5VDEwOjEwOjA0LjcyNVoiLCJpZCI6ImY2MTg4NDNhLTI2YmUtNGE1NC1hNjBmLWY0Y2U4OGE1OTRmMCJ9',
                  endCursor:
                    'eyJjcmVhdGVkQXQiOiIyMDI0LTA5LTE5VDEwOjEwOjA0LjcyNVoiLCJpZCI6ImY2MTg4NDNhLTI2YmUtNGE1NC1hNjBmLWY0Y2U4OGE1OTRmMCJ9',
                },
                edges: [
                  {
                    __typename: 'WorkflowVersionEdge',
                    cursor:
                      'eyJjcmVhdGVkQXQiOiIyMDI0LTA5LTE5VDEwOjEwOjA0LjcyNVoiLCJpZCI6ImY2MTg4NDNhLTI2YmUtNGE1NC1hNjBmLWY0Y2U4OGE1OTRmMCJ9',
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
                      workflowId: '200c1508-f102-4bb9-af32-eda55239ae61',
                    },
                  },
                ],
              },
            },
          });
        }),
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

export const ActiveVersion: Story = {
  parameters: {
    msw: {
      handlers: [
        graphql.query('FindManyWorkflows', () => {
          return HttpResponse.json({
            data: {
              workflows: {
                __typename: 'WorkflowConnection',
                totalCount: 1,
                pageInfo: {
                  __typename: 'PageInfo',
                  hasNextPage: false,
                  hasPreviousPage: false,
                  startCursor:
                    'eyJpZCI6IjIwMGMxNTA4LWYxMDItNGJiOS1hZjMyLWVkYTU1MjM5YWU2MSJ9',
                  endCursor:
                    'eyJpZCI6IjIwMGMxNTA4LWYxMDItNGJiOS1hZjMyLWVkYTU1MjM5YWU2MSJ9',
                },
                edges: [
                  {
                    __typename: 'WorkflowEdge',
                    cursor:
                      'eyJpZCI6IjIwMGMxNTA4LWYxMDItNGJiOS1hZjMyLWVkYTU1MjM5YWU2MSJ9',
                    node: {
                      __typename: 'Workflow',
                      id: '200c1508-f102-4bb9-af32-eda55239ae61',
                    },
                  },
                ],
              },
            },
          });
        }),
        graphql.query('FindOneWorkflow', () => {
          console.log('FindOneWorkflow in ActiveVersion story');

          return HttpResponse.json({
            data: {
              workflow: {
                __typename: 'Workflow',
                id: '200c1508-f102-4bb9-af32-eda55239ae61',
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
                        workflowId: '200c1508-f102-4bb9-af32-eda55239ae61',
                      },
                    },
                  ],
                },
              },
            },
          });
        }),
        graphql.query('FindManyWorkflowVersions', () => {
          return HttpResponse.json({
            data: {
              workflowVersions: {
                __typename: 'WorkflowVersionConnection',
                totalCount: 1,
                pageInfo: {
                  __typename: 'PageInfo',
                  hasNextPage: false,
                  hasPreviousPage: false,
                  startCursor:
                    'eyJjcmVhdGVkQXQiOiIyMDI0LTA5LTE5VDEwOjEwOjA0LjcyNVoiLCJpZCI6ImY2MTg4NDNhLTI2YmUtNGE1NC1hNjBmLWY0Y2U4OGE1OTRmMCJ9',
                  endCursor:
                    'eyJjcmVhdGVkQXQiOiIyMDI0LTA5LTE5VDEwOjEwOjA0LjcyNVoiLCJpZCI6ImY2MTg4NDNhLTI2YmUtNGE1NC1hNjBmLWY0Y2U4OGE1OTRmMCJ9',
                },
                edges: [
                  {
                    __typename: 'WorkflowVersionEdge',
                    cursor:
                      'eyJjcmVhdGVkQXQiOiIyMDI0LTA5LTE5VDEwOjEwOjA0LjcyNVoiLCJpZCI6ImY2MTg4NDNhLTI2YmUtNGE1NC1hNjBmLWY0Y2U4OGE1OTRmMCJ9',
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
                      workflowId: '200c1508-f102-4bb9-af32-eda55239ae61',
                    },
                  },
                ],
              },
            },
          });
        }),
      ],
    },
  },
  play: async () => {
    const canvas = within(document.body);

    expect(await canvas.findByText('Test')).toBeVisible();
    expect(await canvas.findByText('Deactivate')).toBeVisible();
  },
};

export const DraftVersionWithPreviousActiveVersion: Story = {
  parameters: {
    msw: {
      handlers: [
        graphql.query('FindManyWorkflows', () => {
          return HttpResponse.json({
            data: {
              workflows: {
                __typename: 'WorkflowConnection',
                totalCount: 1,
                pageInfo: {
                  __typename: 'PageInfo',
                  hasNextPage: false,
                  hasPreviousPage: false,
                  startCursor:
                    'eyJpZCI6IjIwMGMxNTA4LWYxMDItNGJiOS1hZjMyLWVkYTU1MjM5YWU2MSJ9',
                  endCursor:
                    'eyJpZCI6IjIwMGMxNTA4LWYxMDItNGJiOS1hZjMyLWVkYTU1MjM5YWU2MSJ9',
                },
                edges: [
                  {
                    __typename: 'WorkflowEdge',
                    cursor:
                      'eyJpZCI6IjIwMGMxNTA4LWYxMDItNGJiOS1hZjMyLWVkYTU1MjM5YWU2MSJ9',
                    node: {
                      __typename: 'Workflow',
                      id: '200c1508-f102-4bb9-af32-eda55239ae61',
                    },
                  },
                ],
              },
            },
          });
        }),
        graphql.query('FindOneWorkflow', () => {
          return HttpResponse.json({
            data: {
              workflow: {
                __typename: 'Workflow',
                id: '200c1508-f102-4bb9-af32-eda55239ae61',
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
                        createdAt: '2024-09-19T10:10:05.725Z',
                        status: 'DRAFT',
                        name: 'v2',
                        id: 'f618843a-26be-4a54-a60f-f4ce88a594f1',
                        trigger: null,
                        deletedAt: null,
                        workflowId: '200c1508-f102-4bb9-af32-eda55239ae61',
                      },
                    },
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
                        workflowId: '200c1508-f102-4bb9-af32-eda55239ae61',
                      },
                    },
                  ],
                },
              },
            },
          });
        }),
        graphql.query('FindManyWorkflowVersions', () => {
          return HttpResponse.json({
            data: {
              workflowVersions: {
                __typename: 'WorkflowVersionConnection',
                totalCount: 1,
                pageInfo: {
                  __typename: 'PageInfo',
                  hasNextPage: false,
                  hasPreviousPage: false,
                  startCursor:
                    'eyJjcmVhdGVkQXQiOiIyMDI0LTA5LTE5VDEwOjEwOjA0LjcyNVoiLCJpZCI6ImY2MTg4NDNhLTI2YmUtNGE1NC1hNjBmLWY0Y2U4OGE1OTRmMCJ9',
                  endCursor:
                    'eyJjcmVhdGVkQXQiOiIyMDI0LTA5LTE5VDEwOjEwOjA0LjcyNVoiLCJpZCI6ImY2MTg4NDNhLTI2YmUtNGE1NC1hNjBmLWY0Y2U4OGE1OTRmMCJ9',
                },
                edges: [
                  {
                    __typename: 'WorkflowVersionEdge',
                    cursor:
                      'eyJjcmVhdGVkQXQiOiIyMDI0LTA5LTE5VDEwOjEwOjA0LjcyNVoiLCJpZCI6ImY2MTg4NDNhLTI2YmUtNGE1NC1hNjBmLWY0Y2U4OGE1OTRmMCJ9',
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
                      workflowId: '200c1508-f102-4bb9-af32-eda55239ae61',
                    },
                  },
                ],
              },
            },
          });
        }),
      ],
    },
  },
  play: async () => {
    const canvas = within(document.body);

    expect(await canvas.findByText('Test')).toBeVisible();
    expect(await canvas.findByText('Discard Draft')).toBeVisible();
  },
};

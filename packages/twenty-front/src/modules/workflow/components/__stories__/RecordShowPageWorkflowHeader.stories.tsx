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
                      id: blankInitialVersionWorkflowId,
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
                      workflowId: blankInitialVersionWorkflowId,
                    },
                  },
                ],
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
                    'eyJwb3NpdGlvbiI6LTEsImlkIjoiN2JlM2E4MmMtNDRiNy00MTUwLWEyZTgtNDA4ODcxNDZmNGQ0In0=',
                  endCursor:
                    'eyJwb3NpdGlvbiI6LTEsImlkIjoiN2JlM2E4MmMtNDRiNy00MTUwLWEyZTgtNDA4ODcxNDZmNGQ0In0=',
                },
                edges: [
                  {
                    __typename: 'WorkflowEdge',
                    cursor:
                      'eyJwb3NpdGlvbiI6LTEsImlkIjoiN2JlM2E4MmMtNDRiNy00MTUwLWEyZTgtNDA4ODcxNDZmNGQ0In0=',
                    node: {
                      __typename: 'Workflow',
                      id: activeVersionWorkflowId,
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
                name: 'test qqqq',
                lastPublishedVersionId: 'b57e577a-ae55-4de2-ba08-fe361dcc1a57',
                id: activeVersionWorkflowId,
                deletedAt: null,
                statuses: null,
                createdAt: '2024-09-20T10:18:59.977Z',
                updatedAt: '2024-09-20T16:59:37.212Z',
                position: -1,
                runs: {
                  __typename: 'WorkflowRunConnection',
                  edges: [],
                },
                favorites: {
                  __typename: 'FavoriteConnection',
                  edges: [],
                },
                eventListeners: {
                  __typename: 'WorkflowEventListenerConnection',
                  edges: [],
                },
                versions: {
                  __typename: 'WorkflowVersionConnection',
                  edges: [
                    {
                      __typename: 'WorkflowVersionEdge',
                      node: {
                        __typename: 'WorkflowVersion',
                        updatedAt: '2024-09-20T16:59:37.212Z',
                        status: 'ARCHIVED',
                        deletedAt: null,
                        steps: [
                          {
                            id: '93c41c1d-eff3-4c91-ac61-f56cc1a0df8a',
                            name: 'Code',
                            type: 'CODE',
                            valid: false,
                            settings: {
                              errorHandlingOptions: {
                                retryOnFailure: {
                                  value: false,
                                },
                                continueOnFailure: {
                                  value: false,
                                },
                              },
                              serverlessFunctionId: '',
                            },
                          },
                        ],
                        workflowId: activeVersionWorkflowId,
                        trigger: {
                          type: 'DATABASE_EVENT',
                          settings: {
                            eventName: 'note.created',
                          },
                        },
                        name: 'v1',
                        id: '394cd0b5-bd48-41d7-a110-a92cafaf171d',
                        createdAt: '2024-09-20T10:19:00.141Z',
                      },
                    },
                    {
                      __typename: 'WorkflowVersionEdge',
                      node: {
                        __typename: 'WorkflowVersion',
                        updatedAt: '2024-09-20T17:01:15.637Z',
                        status: 'DRAFT',
                        deletedAt: null,
                        steps: [
                          {
                            id: '93c41c1d-eff3-4c91-ac61-f56cc1a0df8a',
                            name: 'Code',
                            type: 'CODE',
                            valid: false,
                            settings: {
                              errorHandlingOptions: {
                                retryOnFailure: {
                                  value: false,
                                },
                                continueOnFailure: {
                                  value: false,
                                },
                              },
                              serverlessFunctionId: '',
                            },
                          },
                          {
                            id: '4177d57d-35dc-4eb1-a467-07e25cb31da0',
                            name: 'Code',
                            type: 'CODE',
                            valid: false,
                            settings: {
                              errorHandlingOptions: {
                                retryOnFailure: {
                                  value: false,
                                },
                                continueOnFailure: {
                                  value: false,
                                },
                              },
                              serverlessFunctionId: '',
                            },
                          },
                          {
                            id: '0cc392d9-5f28-4d92-90a0-08180f264e68',
                            name: 'Code',
                            type: 'CODE',
                            valid: false,
                            settings: {
                              errorHandlingOptions: {
                                retryOnFailure: {
                                  value: false,
                                },
                                continueOnFailure: {
                                  value: false,
                                },
                              },
                              serverlessFunctionId: '',
                            },
                          },
                        ],
                        workflowId: activeVersionWorkflowId,
                        trigger: {
                          type: 'DATABASE_EVENT',
                          settings: {
                            eventName: 'note.created',
                          },
                        },
                        name: 'v3',
                        id: '5eae34ef-9d62-4a9e-b827-3eb927481728',
                        createdAt: '2024-09-20T17:01:15.637Z',
                      },
                    },
                    {
                      __typename: 'WorkflowVersionEdge',
                      node: {
                        __typename: 'WorkflowVersion',
                        updatedAt: '2024-09-20T17:00:16.097Z',
                        status: 'ACTIVE',
                        deletedAt: null,
                        steps: [
                          {
                            id: '93c41c1d-eff3-4c91-ac61-f56cc1a0df8a',
                            name: 'Code',
                            type: 'CODE',
                            valid: false,
                            settings: {
                              errorHandlingOptions: {
                                retryOnFailure: {
                                  value: false,
                                },
                                continueOnFailure: {
                                  value: false,
                                },
                              },
                              serverlessFunctionId: '',
                            },
                          },
                          {
                            id: '4177d57d-35dc-4eb1-a467-07e25cb31da0',
                            name: 'Code',
                            type: 'CODE',
                            valid: false,
                            settings: {
                              errorHandlingOptions: {
                                retryOnFailure: {
                                  value: false,
                                },
                                continueOnFailure: {
                                  value: false,
                                },
                              },
                              serverlessFunctionId: '',
                            },
                          },
                        ],
                        workflowId: activeVersionWorkflowId,
                        trigger: {
                          type: 'DATABASE_EVENT',
                          settings: {
                            eventName: 'note.created',
                          },
                        },
                        name: 'v2',
                        id: 'b57e577a-ae55-4de2-ba08-fe361dcc1a57',
                        createdAt: '2024-09-20T16:59:35.755Z',
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
                totalCount: 3,
                pageInfo: {
                  __typename: 'PageInfo',
                  hasNextPage: true,
                  hasPreviousPage: false,
                  startCursor:
                    'eyJjcmVhdGVkQXQiOiIyMDI0LTA5LTIwVDE3OjAxOjE1LjYzN1oiLCJpZCI6IjVlYWUzNGVmLTlkNjItNGE5ZS1iODI3LTNlYjkyNzQ4MTcyOCJ9',
                  endCursor:
                    'eyJjcmVhdGVkQXQiOiIyMDI0LTA5LTIwVDE3OjAxOjE1LjYzN1oiLCJpZCI6IjVlYWUzNGVmLTlkNjItNGE5ZS1iODI3LTNlYjkyNzQ4MTcyOCJ9',
                },
                edges: [
                  {
                    __typename: 'WorkflowVersionEdge',
                    cursor:
                      'eyJjcmVhdGVkQXQiOiIyMDI0LTA5LTIwVDE3OjAxOjE1LjYzN1oiLCJpZCI6IjVlYWUzNGVmLTlkNjItNGE5ZS1iODI3LTNlYjkyNzQ4MTcyOCJ9',
                    node: {
                      __typename: 'WorkflowVersion',
                      updatedAt: '2024-09-20T17:01:15.637Z',
                      status: 'ACTIVE',
                      deletedAt: null,
                      steps: [
                        {
                          id: '93c41c1d-eff3-4c91-ac61-f56cc1a0df8a',
                          name: 'Code',
                          type: 'CODE',
                          valid: false,
                          settings: {
                            errorHandlingOptions: {
                              retryOnFailure: {
                                value: false,
                              },
                              continueOnFailure: {
                                value: false,
                              },
                            },
                            serverlessFunctionId: '',
                          },
                        },
                        {
                          id: '4177d57d-35dc-4eb1-a467-07e25cb31da0',
                          name: 'Code',
                          type: 'CODE',
                          valid: false,
                          settings: {
                            errorHandlingOptions: {
                              retryOnFailure: {
                                value: false,
                              },
                              continueOnFailure: {
                                value: false,
                              },
                            },
                            serverlessFunctionId: '',
                          },
                        },
                        {
                          id: '0cc392d9-5f28-4d92-90a0-08180f264e68',
                          name: 'Code',
                          type: 'CODE',
                          valid: false,
                          settings: {
                            errorHandlingOptions: {
                              retryOnFailure: {
                                value: false,
                              },
                              continueOnFailure: {
                                value: false,
                              },
                            },
                            serverlessFunctionId: '',
                          },
                        },
                      ],
                      workflowId: activeVersionWorkflowId,
                      trigger: {
                        type: 'DATABASE_EVENT',
                        settings: {
                          eventName: 'note.created',
                        },
                      },
                      name: 'v3',
                      id: '5eae34ef-9d62-4a9e-b827-3eb927481728',
                      createdAt: '2024-09-20T17:01:15.637Z',
                    },
                  },
                ],
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
                      id: draftVersionWithPreviousActiveVersionWorkflowId,
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
                      workflowId:
                        draftVersionWithPreviousActiveVersionWorkflowId,
                    },
                  },
                ],
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

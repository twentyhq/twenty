import { getOperationName } from '@apollo/client/utilities';
import { graphql, type GraphQLQuery, http, HttpResponse } from 'msw';

import { TRACK_ANALYTICS } from '@/analytics/graphql/queries/track';
import { FIND_MANY_OBJECT_METADATA_ITEMS } from '@/object-metadata/graphql/queries';
import { GET_CURRENT_USER } from '@/users/graphql/queries/getCurrentUser';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { mockedApiKeys } from '~/testing/mock-data/api-keys';
import {
  getCompaniesRecordConnectionMock,
  getCompanyDuplicateMock,
} from '~/testing/mock-data/companies';
import { mockedClientConfig } from '~/testing/mock-data/config';
import { mockedFavoritesData } from '~/testing/mock-data/favorite';
import { mockedFavoriteFoldersData } from '~/testing/mock-data/favorite-folders';
import { mockedNotes } from '~/testing/mock-data/notes';
import { getPeopleRecordConnectionMock } from '~/testing/mock-data/people';
import { mockedPublicWorkspaceDataBySubdomain } from '~/testing/mock-data/publicWorkspaceDataBySubdomain';
import { mockedRemoteTables } from '~/testing/mock-data/remote-tables';
import { mockedUserData } from '~/testing/mock-data/users';
import { mockedViewsData } from '~/testing/mock-data/views';
import { mockWorkspaceMembers } from '~/testing/mock-data/workspace-members';

import { GET_PUBLIC_WORKSPACE_DATA_BY_DOMAIN } from '@/auth/graphql/queries/getPublicWorkspaceDataByDomain';
import { LIST_PLANS } from '@/billing/graphql/queries/listPlans';
import { GET_ROLES } from '@/settings/roles/graphql/queries/getRolesQuery';
import { isDefined } from 'twenty-shared/utils';
import { mockBillingPlans } from '~/testing/mock-data/billing-plans';
import { mockedStandardObjectMetadataQueryResult } from '~/testing/mock-data/generated/mock-metadata-query-result';
import { getRolesMock } from '~/testing/mock-data/roles';
import { mockedTasks } from '~/testing/mock-data/tasks';
import {
  getWorkflowMock,
  getWorkflowVersionsMock,
  workflowQueryResult,
} from '~/testing/mock-data/workflow';
import { oneSucceededWorkflowRunQueryResult } from '~/testing/mock-data/workflow-run';
import { mockedRemoteServers } from './mock-data/remote-servers';
import { mockedViewFieldsData } from './mock-data/view-fields';

const peopleMock = getPeopleRecordConnectionMock();
const companiesMock = getCompaniesRecordConnectionMock();
const duplicateCompanyMock = getCompanyDuplicateMock();

export const metadataGraphql = graphql.link(
  `${REACT_APP_SERVER_BASE_URL}/metadata`,
);

export const graphqlMocks = {
  handlers: [
    graphql.query('IntrospectionQuery', () => {
      return HttpResponse.json({
        data: {
          __schema: {
            queryType: { name: 'Query' },
            types: [
              {
                kind: 'OBJECT',
                name: 'Query',
                fields: [
                  {
                    name: 'name',
                    type: { kind: 'SCALAR', name: 'String' },
                    args: [],
                  },
                ],
                interfaces: [],
                args: [],
              },
              {
                kind: 'SCALAR',
                name: 'String',
                fields: [],
                interfaces: [],
                args: [],
              },
            ],
            directives: [],
          },
        },
      });
    }),

    graphql.query(getOperationName(GET_CURRENT_USER) ?? '', () => {
      return HttpResponse.json({
        data: {
          currentUser: mockedUserData,
        },
      });
    }),
    graphql.query(
      getOperationName(GET_PUBLIC_WORKSPACE_DATA_BY_DOMAIN) ?? '',
      () => {
        return HttpResponse.json({
          data: {
            getPublicWorkspaceDataByDomain:
              mockedPublicWorkspaceDataBySubdomain,
          },
        });
      },
    ),
    graphql.mutation(getOperationName(TRACK_ANALYTICS) ?? '', () => {
      return HttpResponse.json({
        data: {
          track: { success: 1, __typename: 'TRACK_ANALYTICS' },
        },
      });
    }),
    http.get(`${REACT_APP_SERVER_BASE_URL}/client-config`, () => {
      return HttpResponse.json(mockedClientConfig);
    }),
    metadataGraphql.query(
      getOperationName(FIND_MANY_OBJECT_METADATA_ITEMS) ?? '',
      () => {
        return HttpResponse.json({
          data: mockedStandardObjectMetadataQueryResult,
        });
      },
    ),
    graphql.query('SearchPeople', () => {
      return HttpResponse.json({
        data: {
          searchPeople: {
            edges: peopleMock.slice(0, 3).map((person) => ({
              node: person,
              cursor: null,
            })),
            pageInfo: {
              hasNextPage: false,
              hasPreviousPage: false,
              startCursor: null,
              endCursor: null,
            },
          },
        },
      });
    }),
    graphql.query('SearchCompanies', () => {
      return HttpResponse.json({
        data: {
          searchCompanies: {
            edges: companiesMock.slice(0, 3).map((company) => ({
              node: company,
              cursor: null,
            })),
            pageInfo: {
              hasNextPage: false,
              hasPreviousPage: false,
              startCursor: null,
              endCursor: null,
            },
          },
        },
      });
    }),
    graphql.query('SearchOpportunities', () => {
      return HttpResponse.json({
        data: {
          searchOpportunities: {
            edges: [],
            pageInfo: {
              hasNextPage: false,
              hasPreviousPage: false,
              startCursor: null,
              endCursor: null,
            },
          },
        },
      });
    }),
    graphql.query('Search', () => {
      return HttpResponse.json({
        data: {
          search: {
            edges: [
              {
                node: {
                  __typename: 'SearchRecordDTO',
                  recordId: '20202020-2d40-4e49-8df4-9c6a049191de',
                  objectNameSingular: 'person',
                  label: 'Louis Duss',
                  imageUrl: '',
                  tsRankCD: 0.2,
                  tsRank: 0.12158542,
                },
                cursor: 'cursor-1',
              },
              {
                node: {
                  __typename: 'SearchRecordDTO',
                  recordId: '20202020-3ec3-4fe3-8997-b76aa0bfa408',
                  objectNameSingular: 'company',
                  label: 'Linkedin',
                  imageUrl: 'https://twenty-icons.com/linkedin.com',
                  tsRankCD: 0.2,
                  tsRank: 0.12158542,
                },
                cursor: 'cursor-2',
              },
              {
                node: {
                  __typename: 'SearchRecordDTO',
                  recordId: '20202020-3f74-492d-a101-2a70f50a1645',
                  objectNameSingular: 'company',
                  label: 'Libeo',
                  imageUrl: 'https://twenty-icons.com/libeo.io',
                  tsRankCD: 0.2,
                  tsRank: 0.12158542,
                },
                cursor: 'cursor-3',
              },
              {
                node: {
                  __typename: 'SearchRecordDTO',
                  recordId: '20202020-ac73-4797-824e-87a1f5aea9e0',
                  objectNameSingular: 'person',
                  label: 'Sylvie Palmer',
                  imageUrl: '',
                  tsRankCD: 0.1,
                  tsRank: 0.06079271,
                },
                cursor: 'cursor-4',
              },
            ],
            pageInfo: {
              hasNextPage: true,
              endCursor: 'cursor-4',
            },
          },
        },
      });
    }),
    graphql.query('FindManyViews', ({ variables }) => {
      const objectMetadataId = variables.filter?.objectMetadataId?.eq;
      const viewType = variables.filter?.type?.eq;

      return HttpResponse.json({
        data: {
          views: {
            edges: mockedViewsData
              .filter(
                (view) =>
                  (isDefined(objectMetadataId)
                    ? view?.objectMetadataId === objectMetadataId
                    : true) &&
                  (isDefined(viewType) ? view?.type === viewType : true),
              )
              .map((view) => ({
                node: {
                  ...view,
                  viewFields: {
                    edges: mockedViewFieldsData
                      .filter((viewField) => viewField.viewId === view.id)
                      .map((viewField) => ({
                        node: viewField,
                        cursor: null,
                      })),
                    totalCount: mockedViewFieldsData.filter(
                      (viewField) => viewField.viewId === view.id,
                    ).length,
                  },
                },
                cursor: null,
              })),
            pageInfo: {
              hasNextPage: false,
              hasPreviousPage: false,
              startCursor: null,
              endCursor: null,
            },
          },
        },
      });
    }),
    graphql.query('SearchWorkspaceMembers', () => {
      return HttpResponse.json({
        data: {
          searchWorkspaceMembers: {
            edges: mockWorkspaceMembers.map((member) => ({
              node: {
                ...member,
                messageParticipants: {
                  edges: [],
                  __typename: 'MessageParticipantConnection',
                },
                authoredAttachments: {
                  edges: [],
                  __typename: 'AttachmentConnection',
                },
                authoredComments: {
                  edges: [],
                  __typename: 'CommentConnection',
                },
                accountOwnerForCompanies: {
                  edges: [],
                  __typename: 'CompanyConnection',
                },
                authoredActivities: {
                  edges: [],
                  __typename: 'ActivityConnection',
                },
                favorites: {
                  edges: [],
                  __typename: 'FavoriteConnection',
                },
                connectedAccounts: {
                  edges: [],
                  __typename: 'ConnectedAccountConnection',
                },
                assignedActivities: {
                  edges: [],
                  __typename: 'ActivityConnection',
                },
              },
              cursor: null,
            })),
          },
        },
      });
    }),
    graphql.query('FindManyViewFields', ({ variables }) => {
      const viewId = variables.filter.view.eq;

      return HttpResponse.json({
        data: {
          viewFields: {
            edges: mockedViewFieldsData
              .filter((viewField) => viewField.viewId === viewId)
              .map((viewField) => ({
                node: viewField,
                cursor: null,
              })),
            pageInfo: {
              hasNextPage: false,
              hasPreviousPage: false,
              startCursor: null,
              endCursor: null,
            },
          },
        },
      });
    }),
    graphql.query('FindManyCompanies', ({ variables }) => {
      const mockedData = variables.limit
        ? companiesMock.slice(0, variables.limit)
        : companiesMock;

      return HttpResponse.json({
        data: {
          companies: {
            edges: mockedData.map((company) => ({
              node: {
                ...company,
                favorites: {
                  edges: [],
                  __typename: 'FavoriteConnection',
                },
                attachments: {
                  edges: [],
                  __typename: 'AttachmentConnection',
                },
                people: {
                  edges: [],
                  __typename: 'PersonConnection',
                },
                opportunities: {
                  edges: [],
                  __typename: 'OpportunityConnection',
                },
                taskTargets: {
                  edges: [],
                  __typename: 'TaskTargetConnection',
                },
                noteTargets: {
                  edges: [],
                  __typename: 'NoteTargetConnection',
                },
              },
              cursor: null,
            })),
            pageInfo: {
              hasNextPage: false,
              hasPreviousPage: false,
              startCursor: null,
              endCursor: null,
            },
            totalCount: mockedData.length,
          },
        },
      });
    }),
    graphql.query('FindDuplicateCompany', () => {
      return HttpResponse.json({
        data: {
          companyDuplicates: [
            {
              edges: [
                {
                  node: {
                    ...duplicateCompanyMock,
                    favorites: {
                      edges: [],
                      __typename: 'FavoriteConnection',
                    },
                    attachments: {
                      edges: [],
                      __typename: 'AttachmentConnection',
                    },
                    people: {
                      edges: [],
                      __typename: 'PersonConnection',
                    },
                    opportunities: {
                      edges: [],
                      __typename: 'OpportunityConnection',
                    },
                    taskTargets: {
                      edges: [],
                      __typename: 'TaskTargetConnection',
                    },
                    noteTargets: {
                      edges: [],
                      __typename: 'NoteTargetConnection',
                    },
                  },
                  cursor: null,
                },
              ],
              pageInfo: {
                hasNextPage: false,
                hasPreviousPage: false,
                startCursor: null,
                endCursor: null,
              },
            },
          ],
        },
      });
    }),
    graphql.query('FindManyPeople', () => {
      return HttpResponse.json({
        data: {
          people: {
            edges: peopleMock.map((person) => ({
              node: person,
              cursor: null,
            })),
            pageInfo: {
              hasNextPage: false,
              hasPreviousPage: false,
              startCursor: null,
              endCursor: null,
            },
          },
        },
      });
    }),
    graphql.query('FindManyNotes', () => {
      return HttpResponse.json({
        data: {
          activities: {
            edges: mockedNotes.map(({ noteTargets, ...rest }) => ({
              node: {
                ...rest,
                noteTargets: {
                  edges: noteTargets?.map((t) => ({ node: t })),
                },
                attachments: {
                  edges: [],
                },
              },
              cursor: null,
            })),
            pageInfo: {
              hasNextPage: false,
              hasPreviousPage: false,
              startCursor: null,
              endCursor: null,
            },
          },
        },
      });
    }),
    graphql.query('FindManyTasks', () => {
      return HttpResponse.json({
        data: {
          tasks: {
            edges: mockedTasks.map(({ taskTargets, ...rest }) => ({
              node: {
                ...rest,
                taskTargets: {
                  edges: taskTargets?.map((t) => ({ node: t })),
                },
                attachments: {
                  edges: [],
                },
              },
              cursor: null,
            })),
            pageInfo: {
              hasNextPage: false,
              hasPreviousPage: false,
              startCursor: null,
              endCursor: null,
            },
          },
        },
      });
    }),
    graphql.query('FindManyTaskTargets', () => {
      return HttpResponse.json({
        data: {
          taskTargets: {
            edges: mockedTasks.flatMap((task) =>
              task.taskTargets.map((target) => ({
                node: target,
                cursor: null,
              })),
            ),
            pageInfo: {
              hasNextPage: false,
              hasPreviousPage: false,
              startCursor: null,
              endCursor: null,
            },
          },
        },
      });
    }),
    graphql.query('FindManyFavoriteFolders', () => {
      return HttpResponse.json({
        data: {
          favoriteFolders: {
            edges: mockedFavoriteFoldersData.map((favoriteFolder) => ({
              node: favoriteFolder,
              cursor: null,
            })),
            pageInfo: {
              hasNextPage: false,
              hasPreviousPage: false,
              startCursor: null,
              endCursor: null,
            },
          },
        },
      });
    }),
    graphql.query('FindManyFavorites', () => {
      return HttpResponse.json({
        data: {
          favorites: {
            edges: mockedFavoritesData.map((favorite) => ({
              node: favorite,
              cursor: null,
            })),
            pageInfo: {
              hasNextPage: false,
              hasPreviousPage: false,
              startCursor: null,
              endCursor: null,
            },
          },
        },
      });
    }),
    graphql.query('FindManyOpportunities', () => {
      return HttpResponse.json({
        data: {
          opportunities: {
            edges: [],
            pageInfo: {
              hasNextPage: false,
              hasPreviousPage: false,
              startCursor: null,
              endCursor: null,
            },
          },
        },
      });
    }),
    graphql.query('FindManyWorkspaceMembers', () => {
      return HttpResponse.json({
        data: {
          workspaceMembers: {
            edges: mockWorkspaceMembers.map((member) => ({
              node: {
                ...member,
                messageParticipants: {
                  edges: [],
                  __typename: 'MessageParticipantConnection',
                },
                authoredAttachments: {
                  edges: [],
                  __typename: 'AttachmentConnection',
                },
                authoredComments: {
                  edges: [],
                  __typename: 'CommentConnection',
                },
                accountOwnerForCompanies: {
                  edges: [],
                  __typename: 'CompanyConnection',
                },
                authoredActivities: {
                  edges: [],
                  __typename: 'ActivityConnection',
                },
                favorites: {
                  edges: [],
                  __typename: 'FavoriteConnection',
                },
                connectedAccounts: {
                  edges: [],
                  __typename: 'ConnectedAccountConnection',
                },
                assignedActivities: {
                  edges: [],
                  __typename: 'ActivityConnection',
                },
              },
              cursor: null,
            })),
            pageInfo: {
              hasNextPage: false,
              hasPreviousPage: false,
              startCursor: null,
              endCursor: null,
            },
          },
        },
      });
    }),
    graphql.query('GetOneDatabaseConnection', () => {
      return HttpResponse.json({
        data: {
          findOneRemoteServerById: mockedRemoteServers[0],
        },
      });
    }),
    graphql.query('GetManyRemoteTables', () => {
      return HttpResponse.json({
        data: {
          findDistantTablesWithStatus: mockedRemoteTables,
        },
      });
    }),
    graphql.query<GraphQLQuery, { objectRecordId: string }>(
      'FindOnePerson',
      ({ variables: { objectRecordId } }) => {
        return HttpResponse.json({
          data: {
            person: peopleMock.find((person) => person.id === objectRecordId),
          },
        });
      },
    ),
    graphql.query('FindManyWorkflows', () => {
      return HttpResponse.json({
        data: workflowQueryResult,
      });
    }),
    graphql.query('FindOneWorkflow', () => {
      return HttpResponse.json({
        data: {
          workflow: getWorkflowMock(),
        },
      });
    }),
    graphql.query('FindOneWorkflowRun', () => {
      return HttpResponse.json({
        data: oneSucceededWorkflowRunQueryResult,
      });
    }),
    graphql.query('FindManyWorkflowVersions', () => {
      return HttpResponse.json({
        data: {
          workflowVersions: getWorkflowVersionsMock(),
        },
      });
    }),
    graphql.query(getOperationName(GET_ROLES) ?? '', () => {
      return HttpResponse.json({
        data: {
          getRoles: getRolesMock(),
        },
      });
    }),
    graphql.query(getOperationName(LIST_PLANS) ?? '', () => {
      return HttpResponse.json({
        data: mockBillingPlans,
      });
    }),
    http.get('https://chat-assets.frontapp.com/v1/chat.bundle.js', () => {
      return HttpResponse.text(
        `
          window.FrontChat = () => {};
          console.log("This is a mocked script response.");
          // Additional JavaScript code here
        `,
        { status: 200 },
      );
    }),
    metadataGraphql.query('GetApiKeys', () => {
      return HttpResponse.json({
        data: {
          apiKeys: mockedApiKeys.map((apiKey) => ({
            __typename: 'ApiKey',
            ...apiKey,
            revokedAt: null,
          })),
        },
      });
    }),
    metadataGraphql.query('GetApiKey', ({ variables }) => {
      const apiKeyId = variables.input?.id;
      const apiKey = mockedApiKeys.find((key) => key.id === apiKeyId);

      return HttpResponse.json({
        data: {
          apiKey: apiKey
            ? {
                __typename: 'ApiKey',
                ...apiKey,
                revokedAt: null,
              }
            : null,
        },
      });
    }),
    metadataGraphql.mutation('CreateApiKey', ({ variables }) => {
      const input = variables.input;
      const newApiKey = {
        __typename: 'ApiKey',
        id: '20202020-1234-1234-1234-123456789012',
        name: input.name,
        expiresAt: input.expiresAt,
        revokedAt: null,
        role: {
          __typename: 'Role',
          id: input.roleId,
          label: input.roleId === '2' ? 'Guest' : 'Admin',
          icon: input.roleId === '2' ? 'IconUser' : 'IconSettings',
        },
      };

      return HttpResponse.json({
        data: {
          createApiKey: newApiKey,
        },
      });
    }),
    metadataGraphql.mutation('AssignRoleToApiKey', () => {
      return HttpResponse.json({
        data: {
          assignRoleToApiKey: true,
        },
      });
    }),
    metadataGraphql.mutation('GenerateApiKeyToken', () => {
      return HttpResponse.json({
        data: {
          generateApiKeyToken: {
            __typename: 'ApiKeyToken',
            token: 'test-api-key-token-12345',
          },
        },
      });
    }),
    metadataGraphql.mutation('RevokeApiKey', ({ variables }) => {
      return HttpResponse.json({
        data: {
          revokeApiKey: {
            __typename: 'ApiKey',
            id: variables.input?.id,
            name: 'Zapier Integration',
            expiresAt: '2100-11-06T23:59:59.825Z',
            revokedAt: new Date().toISOString(),
            role: {
              __typename: 'Role',
              id: '1',
              label: 'Admin',
              icon: 'IconSettings',
            },
          },
        },
      });
    }),
    metadataGraphql.mutation('UpdateApiKey', ({ variables }) => {
      return HttpResponse.json({
        data: {
          updateApiKey: {
            __typename: 'ApiKey',
            id: variables.input.id,
            name: variables.input.name || 'Updated API Key',
            expiresAt: '2100-11-06T23:59:59.825Z',
            revokedAt: null,
            role: {
              __typename: 'Role',
              id: '1',
              label: 'Admin',
              icon: 'IconSettings',
            },
          },
        },
      });
    }),
    metadataGraphql.query('GetWebhooks', () => {
      return HttpResponse.json({
        data: {
          webhooks: [
            {
              __typename: 'Webhook',
              id: '1234',
              targetUrl: 'https://api.slackbot.io/webhooks/twenty',
              operations: ['*.created', '*.updated'],
              description: 'Slack notifications for lead updates',
              secret: 'sample-secret',
            },
          ],
        },
      });
    }),
    metadataGraphql.query('GetWebhook', ({ variables }) => {
      const webhookId = variables.input?.id;

      return HttpResponse.json({
        data: {
          webhook: {
            __typename: 'Webhook',
            id: webhookId || '1234',
            targetUrl: 'https://api.slackbot.io/webhooks/twenty',
            operations: ['*.created', '*.updated'],
            description: 'Slack notifications for lead updates',
            secret: 'sample-secret',
          },
        },
      });
    }),
  ],
};

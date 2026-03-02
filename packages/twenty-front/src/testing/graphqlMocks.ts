import { getOperationName } from '@apollo/client/utilities';
import { parse, type FieldNode } from 'graphql';
import { graphql, http, HttpResponse, type GraphQLQuery } from 'msw';

import { TRACK_ANALYTICS } from '@/analytics/graphql/queries/track';
import { FIND_MANY_OBJECT_METADATA_ITEMS } from '@/object-metadata/graphql/queries';
import { GET_CURRENT_USER } from '@/users/graphql/queries/getCurrentUser';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { mockedClientConfig } from '~/testing/mock-data/config';
import { mockedFavoriteRecords } from '~/testing/mock-data/generated/data/favorites/mock-favorites-data';
import { mockedFavoriteFoldersData } from '~/testing/mock-data/favorite-folders';
import { mockedNoteRecords } from '~/testing/mock-data/generated/data/notes/mock-notes-data';
import { mockedPersonRecords } from '~/testing/mock-data/generated/data/people/mock-people-data';
import { mockedPublicWorkspaceDataBySubdomain } from '~/testing/mock-data/publicWorkspaceDataBySubdomain';
import { mockedUserData } from '~/testing/mock-data/users';
import { mockedCoreViews } from '~/testing/mock-data/generated/metadata/views/mock-views-data';
import { mockedWorkspaceMemberRecords } from '~/testing/mock-data/generated/data/workspaceMembers/mock-workspaceMembers-data';

import { GET_PUBLIC_WORKSPACE_DATA_BY_DOMAIN } from '@/auth/graphql/queries/getPublicWorkspaceDataByDomain';
import { LIST_PLANS } from '@/billing/graphql/queries/listPlans';
import { GET_ROLES } from '@/settings/roles/graphql/queries/getRolesQuery';
import { isDefined } from 'twenty-shared/utils';
import { mockBillingPlans } from '~/testing/mock-data/billing-plans';
import { mockedCompanyRecords } from '~/testing/mock-data/generated/data/companies/mock-companies-data';
import { mockedStandardObjectMetadataQueryResult } from '~/testing/mock-data/generated/metadata/objects/mock-objects-metadata';
import { mockedRoles } from '~/testing/mock-data/generated/metadata/roles/mock-roles-data';
import { mockedTaskRecords } from '~/testing/mock-data/generated/data/tasks/mock-tasks-data';

import {
  getWorkflowMock,
  getWorkflowVersionsMock,
  workflowQueryResult,
} from '~/testing/mock-data/workflow';
import { oneSucceededWorkflowRunQueryResult } from '~/testing/mock-data/workflow-run';
import { type Task } from '@/activities/types/Task';
import { getConnectionTypename } from '@/object-record/cache/utils/getConnectionTypename';
import { getEdgeTypename } from '@/object-record/cache/utils/getEdgeTypename';
import { getEmptyPageInfo } from '@/object-record/cache/utils/getEmptyPageInfo';
import { getRecordFromRecordNode } from '@/object-record/cache/utils/getRecordFromRecordNode';
import { mockedApiKeys } from '~/testing/mock-data/generated/metadata/api-keys/mock-api-keys-data';

const peopleMock = [...mockedPersonRecords];
const companiesMock = [...mockedCompanyRecords];
const duplicateCompanyMock = {
  ...mockedCompanyRecords[0],
  id: '8b40856a-2ec9-4c03-8bc0-c032c89e1824',
};

const flatTaskRecords = mockedTaskRecords.map((record) =>
  getRecordFromRecordNode<Task>({ recordNode: record }),
);

// Wraps raw server-fetched records (which already have correct field shapes)
// into a GraphQL connection response structure.
const wrapRecordsAsConnection = (
  objectNameSingular: string,
  records: Record<string, unknown>[],
) => ({
  __typename: getConnectionTypename(objectNameSingular),
  edges: records.map((node) => ({
    __typename: getEdgeTypename(objectNameSingular),
    node,
    cursor: '',
  })),
  pageInfo: getEmptyPageInfo(),
  totalCount: records.length,
});

const getRootFieldNamesFromQuery = (query: string) => {
  try {
    const document = parse(query);
    const operationDefinition = document.definitions.find(
      (definition) => definition.kind === 'OperationDefinition',
    );

    if (
      !operationDefinition ||
      operationDefinition.kind !== 'OperationDefinition'
    ) {
      return [];
    }

    return operationDefinition.selectionSet.selections
      .filter((selection): selection is FieldNode => selection.kind === 'Field')
      .map((selection) => selection.name.value);
  } catch {
    return [];
  }
};

const createEmptyRecordConnection = () => ({
  edges: [],
  pageInfo: {
    hasNextPage: false,
    hasPreviousPage: false,
    startCursor: null,
    endCursor: null,
  },
  totalCount: 0,
});

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
      const personSearchEdges = peopleMock
        .slice(0, 2)
        .map((person: Record<string, unknown>, index: number) => ({
          node: {
            __typename: 'SearchRecordDTO',
            recordId: person.id,
            objectNameSingular: 'person',
            objectLabelSingular: 'Person',
            label:
              `${(person.name as Record<string, string>)?.firstName ?? ''} ${(person.name as Record<string, string>)?.lastName ?? ''}`.trim(),
            imageUrl: '',
            tsRankCD: 0.2,
            tsRank: 0.12158542,
          },
          cursor: `cursor-${index + 1}`,
        }));

      const companySearchEdges = companiesMock
        .slice(0, 2)
        .map((company: Record<string, unknown>, index: number) => ({
          node: {
            __typename: 'SearchRecordDTO',
            recordId: company.id,
            objectNameSingular: 'company',
            objectLabelSingular: 'Company',
            label: company.name,
            imageUrl: '',
            tsRankCD: 0.2,
            tsRank: 0.12158542,
          },
          cursor: `cursor-${personSearchEdges.length + index + 1}`,
        }));

      const allEdges = [...personSearchEdges, ...companySearchEdges];

      return HttpResponse.json({
        data: {
          search: {
            edges: allEdges,
            pageInfo: {
              hasNextPage: true,
              endCursor: allEdges[allEdges.length - 1]?.cursor ?? null,
            },
          },
        },
      });
    }),
    graphql.query('CombinedFindManyRecords', ({ query }) => {
      const rootFieldNames = getRootFieldNamesFromQuery(query ?? '');
      const data = Object.fromEntries(
        rootFieldNames.map((fieldName) => [
          fieldName,
          createEmptyRecordConnection(),
        ]),
      );

      return HttpResponse.json({ data });
    }),
    graphql.query('FindManyViews', ({ variables }) => {
      const objectMetadataId = variables.filter?.objectMetadataId?.eq;
      const viewType = variables.filter?.type?.eq;

      const filtered = mockedCoreViews.filter(
        (view) =>
          (isDefined(objectMetadataId)
            ? view?.objectMetadataId === objectMetadataId
            : true) && (isDefined(viewType) ? view?.type === viewType : true),
      );

      return HttpResponse.json({
        data: {
          views: {
            edges: filtered.map((view) => ({
              node: {
                ...view,
                viewFields: {
                  edges: view.viewFields.map((viewField) => ({
                    node: viewField,
                    cursor: null,
                  })),
                  totalCount: view.viewFields.length,
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
          searchWorkspaceMembers: wrapRecordsAsConnection(
            'workspaceMember',
            mockedWorkspaceMemberRecords as Record<string, unknown>[],
          ),
        },
      });
    }),
    graphql.query('FindManyViewFields', ({ variables }) => {
      const viewId = variables.filter.view.eq;

      const matchingView = mockedCoreViews.find((view) => view.id === viewId);
      const viewFields = matchingView?.viewFields ?? [];

      return HttpResponse.json({
        data: {
          viewFields: {
            edges: viewFields.map((viewField) => ({
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
          companies: wrapRecordsAsConnection('company', mockedData),
        },
      });
    }),
    graphql.query('FindDuplicateCompany', () => {
      return HttpResponse.json({
        data: {
          companyDuplicates: [
            wrapRecordsAsConnection('company', [duplicateCompanyMock]),
          ],
        },
      });
    }),
    graphql.query('FindManyPeople', () => {
      return HttpResponse.json({
        data: {
          people: wrapRecordsAsConnection('person', peopleMock),
        },
      });
    }),
    graphql.query('FindManyNotes', () => {
      return HttpResponse.json({
        data: {
          notes: wrapRecordsAsConnection('note', [...mockedNoteRecords]),
        },
      });
    }),
    graphql.query('FindManyTasks', () => {
      return HttpResponse.json({
        data: {
          tasks: wrapRecordsAsConnection('task', [...mockedTaskRecords]),
        },
      });
    }),
    graphql.query('FindManyTaskTargets', () => {
      const taskTargetNodes = flatTaskRecords.flatMap(
        (task) => task.taskTargets ?? [],
      );

      return HttpResponse.json({
        data: {
          taskTargets: wrapRecordsAsConnection(
            'taskTarget',
            taskTargetNodes as Record<string, unknown>[],
          ),
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
            ...wrapRecordsAsConnection(
              'favorite',
              mockedFavoriteRecords as Record<string, unknown>[],
            ),
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
          workspaceMembers: wrapRecordsAsConnection(
            'workspaceMember',
            mockedWorkspaceMemberRecords as Record<string, unknown>[],
          ),
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
          getRoles: mockedRoles,
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
          apiKeys: mockedApiKeys,
        },
      });
    }),
    metadataGraphql.query('GetApiKey', ({ variables }) => {
      const apiKeyId = variables.input?.id;
      const apiKey = mockedApiKeys.find((key) => key.id === apiKeyId);

      return HttpResponse.json({
        data: {
          apiKey: apiKey ?? null,
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

import { getOperationName } from '@apollo/client/utilities';
import { graphql, GraphQLQuery, http, HttpResponse } from 'msw';

import { TRACK } from '@/analytics/graphql/queries/track';
import { GET_CLIENT_CONFIG } from '@/client-config/graphql/queries/getClientConfig';
import { FIND_MANY_OBJECT_METADATA_ITEMS } from '@/object-metadata/graphql/queries';
import { GET_CURRENT_USER } from '@/users/graphql/queries/getCurrentUser';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import {
  getCompaniesMock,
  getCompanyDuplicateMock,
} from '~/testing/mock-data/companies';
import { mockedClientConfig } from '~/testing/mock-data/config';
import { mockedFavoritesData } from '~/testing/mock-data/favorite';
import { mockedFavoriteFoldersData } from '~/testing/mock-data/favorite-folders';
import { mockedNotes } from '~/testing/mock-data/notes';
import { getPeopleMock } from '~/testing/mock-data/people';
import { mockedRemoteTables } from '~/testing/mock-data/remote-tables';
import { mockedUserData } from '~/testing/mock-data/users';
import { mockedViewsData } from '~/testing/mock-data/views';
import { mockWorkspaceMembers } from '~/testing/mock-data/workspace-members';

import { GET_PUBLIC_WORKSPACE_DATA_BY_DOMAIN } from '@/auth/graphql/queries/getPublicWorkspaceDataByDomain';
import { mockedStandardObjectMetadataQueryResult } from '~/testing/mock-data/generated/mock-metadata-query-result';
import { mockedTasks } from '~/testing/mock-data/tasks';
import {
  getWorkflowMock,
  getWorkflowVersionsMock,
  workflowQueryResult,
} from '~/testing/mock-data/workflow';
import { mockedRemoteServers } from './mock-data/remote-servers';
import { mockedViewFieldsData } from './mock-data/view-fields';

const peopleMock = getPeopleMock();
const companiesMock = getCompaniesMock();
const duplicateCompanyMock = getCompanyDuplicateMock();

export const metadataGraphql = graphql.link(
  `${REACT_APP_SERVER_BASE_URL}/metadata`,
);

export const graphqlMocks = {
  handlers: [
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
            getPublicWorkspaceDataByDomain: {
              id: 'id',
              logo: 'logo',
              displayName: 'displayName',
              workspaceUrls: {
                customUrl: undefined,
                subdomainUrl: 'https://twenty.com',
              },
              authProviders: {
                google: true,
                microsoft: false,
                password: true,
                magicLink: false,
                sso: [],
              },
            },
          },
        });
      },
    ),
    graphql.mutation(getOperationName(TRACK) ?? '', () => {
      return HttpResponse.json({
        data: {
          track: { success: 1, __typename: 'TRACK' },
        },
      });
    }),
    graphql.query(getOperationName(GET_CLIENT_CONFIG) ?? '', () => {
      return HttpResponse.json({
        data: {
          clientConfig: mockedClientConfig,
        },
      });
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
    graphql.query('CombinedSearchRecords', () => {
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
    graphql.query('FindManyViews', ({ variables }) => {
      const objectMetadataId = variables.filter?.objectMetadataId?.eq;
      const viewType = variables.filter?.type?.eq;

      return HttpResponse.json({
        data: {
          views: {
            edges: mockedViewsData
              .filter(
                (view) =>
                  view?.objectMetadataId === objectMetadataId &&
                  view?.type === viewType,
              )
              .map((view) => ({
                node: view,
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
    graphql.query('CombinedFindManyRecords', () => {
      return HttpResponse.json({
        data: {
          favorites: {
            edges: mockedFavoritesData.map((favorite) => ({
              node: favorite,
              cursor: null,
            })),
            totalCount: mockedFavoritesData.length,
            pageInfo: {
              hasNextPage: false,
              hasPreviousPage: false,
              startCursor: null,
              endCursor: null,
            },
          },
          favoriteFolders: {
            edges: [],
            pageInfo: {
              hasNextPage: false,
              hasPreviousPage: false,
              startCursor: null,
              endCursor: null,
            },
          },
          views: {
            edges: mockedViewsData.map((view) => ({
              node: {
                ...view,
                viewFilters: {
                  edges: [],
                  totalCount: 0,
                },
                viewSorts: {
                  edges: [],
                  totalCount: 0,
                },
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
              totalCount: mockedViewsData.length,
            },
            totalCount: mockedViewsData.length,
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
    graphql.query('FindManyWorkflowVersions', () => {
      return HttpResponse.json({
        data: {
          workflowVersions: getWorkflowVersionsMock(),
        },
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
  ],
};

import { getOperationName } from '@apollo/client/utilities';
import { graphql, http, HttpResponse } from 'msw';

import { TRACK } from '@/analytics/graphql/queries/track';
import { GET_CLIENT_CONFIG } from '@/client-config/graphql/queries/getClientConfig';
import { FIND_MANY_OBJECT_METADATA_ITEMS } from '@/object-metadata/graphql/queries';
import { GET_CURRENT_USER } from '@/users/graphql/queries/getCurrentUser';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { mockedActivities } from '~/testing/mock-data/activities';
import {
  mockedCompaniesData,
  mockedDuplicateCompanyData,
} from '~/testing/mock-data/companies';
import { mockedClientConfig } from '~/testing/mock-data/config';
import { mockedUsersData } from '~/testing/mock-data/users';
import { mockWorkspaceMembers } from '~/testing/mock-data/workspace-members';

import { mockedObjectMetadataItems } from './mock-data/metadata';
import { mockedPeopleData } from './mock-data/people';
import { mockedViewFieldsData } from './mock-data/view-fields';
import { mockedViewsData } from './mock-data/views';

const metadataGraphql = graphql.link(`${REACT_APP_SERVER_BASE_URL}/metadata`);

export const graphqlMocks = {
  handlers: [
    graphql.query(getOperationName(GET_CURRENT_USER) ?? '', () => {
      return HttpResponse.json({
        data: {
          currentUser: mockedUsersData[0],
        },
      });
    }),
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
          data: { objects: mockedObjectMetadataItems },
        });
      },
    ),
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
        ? mockedCompaniesData.slice(0, variables.limit)
        : mockedCompaniesData;

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
                activityTargets: {
                  edges: [],
                  __typename: 'ActivityTargetConnection',
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
          companyDuplicates: {
            edges: [
              {
                node: {
                  ...mockedDuplicateCompanyData,
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
                  activityTargets: {
                    edges: [],
                    __typename: 'ActivityTargetConnection',
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
            totalCount: 1,
          },
        },
      });
    }),
    graphql.query('FindManyPeople', () => {
      return HttpResponse.json({
        data: {
          people: {
            edges: mockedPeopleData.map((person) => ({
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
    graphql.query('FindManyActivities', () => {
      return HttpResponse.json({
        data: {
          activities: {
            edges: mockedActivities.map(({ activityTargets, ...rest }) => ({
              node: {
                ...rest,
                activityTargets: {
                  edges: activityTargets.map((t) => ({ node: t })),
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
    graphql.query('FindManyFavorites', () => {
      return HttpResponse.json({
        data: {
          favorites: {
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

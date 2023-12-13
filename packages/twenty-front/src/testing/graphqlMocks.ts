import { getOperationName } from '@apollo/client/utilities';
import { graphql, HttpResponse } from 'msw';

import { CREATE_EVENT } from '@/analytics/graphql/queries/createEvent';
import { GET_CLIENT_CONFIG } from '@/client-config/graphql/queries/getClientConfig';
import { FIND_MANY_OBJECT_METADATA_ITEMS } from '@/object-metadata/graphql/queries';
import { mockedActivities } from '~/testing/mock-data/activities';

import { mockedCompaniesData } from './mock-data/companies';
import { mockedObjectMetadataItems } from './mock-data/metadata';
import { mockedPeopleData } from './mock-data/people';
import { mockedViewFieldsData } from './mock-data/view-fields';
import { mockedViewsData } from './mock-data/views';

const metadataGraphql = graphql.link(
  `${process.env.REACT_APP_SERVER_BASE_URL}/metadata`,
);

export const graphqlMocks = {
  handlers: [
    // graphql.query(getOperationName(GET_CURRENT_USER) ?? '', () => {
    //   return HttpResponse.json({
    //     data: {
    //       currentUser: mockedUsersData[0],
    //     },
    //   });
    // }),
    graphql.mutation(getOperationName(CREATE_EVENT) ?? '', () => {
      return HttpResponse.json({
        data: {
          createEvent: { success: 1, __typename: 'Event' },
        },
      });
    }),
    graphql.query(getOperationName(GET_CLIENT_CONFIG) ?? '', () => {
      return HttpResponse.json({
        data: {
          clientConfig: {
            signInPrefilled: true,
            dataModelSettingsEnabled: true,
            developersSettingsEnabled: true,
            debugMode: false,
            authProviders: { google: true, password: true, magicLink: false },
            telemetry: { enabled: false, anonymizationEnabled: true },
            support: {
              supportDriver: 'front',
              supportFrontChatId: null,
            },
          },
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
      const objectMetadataId = variables.filter.objectMetadataId.eq;
      const viewType = variables.filter.type.eq;

      return HttpResponse.json({
        data: {
          views: {
            edges: mockedViewsData
              .filter(
                (view) =>
                  view.objectMetadataId === objectMetadataId &&
                  view.type === viewType,
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
    graphql.query('FindManyCompanies', () => {
      return HttpResponse.json({
        data: {
          companies: {
            edges: mockedCompaniesData.map((company) => ({
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
            edges: mockedActivities.map((activities) => ({
              node: activities,
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
  ],
};

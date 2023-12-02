import { getOperationName } from '@apollo/client/utilities';
import { graphql } from 'msw';

import { CREATE_EVENT } from '@/analytics/graphql/queries/createEvent';
import { GET_CLIENT_CONFIG } from '@/client-config/graphql/queries/getClientConfig';
import { FIND_MANY_OBJECT_METADATA_ITEMS } from '@/object-metadata/graphql/queries';
import { GET_CURRENT_USER } from '@/users/graphql/queries/getCurrentUser';
import { mockedActivities } from '~/testing/mock-data/activities';
import { mockedCompaniesData } from '~/testing/mock-data/companies';
import { mockedClientConfig } from '~/testing/mock-data/config';
import { mockedPipelineSteps } from '~/testing/mock-data/pipeline-steps';

import { mockedObjectMetadataItems } from './mock-data/metadata';
import { mockedPeopleData } from './mock-data/people';
import { mockedUsersData } from './mock-data/users';
import { mockedViewFieldsData } from './mock-data/view-fields';
import { mockedViewsData } from './mock-data/views';

const metadataGraphql = graphql.link(
  `${process.env.REACT_APP_SERVER_BASE_URL}/metadata`,
);

export const graphqlMocks = {
  handlers: [
    graphql.query(getOperationName(GET_CURRENT_USER) ?? '', (req, res, ctx) => {
      return res(
        ctx.data({
          currentUser: mockedUsersData[0],
        }),
      );
    }),
    graphql.mutation(getOperationName(CREATE_EVENT) ?? '', (req, res, ctx) => {
      return res(
        ctx.data({
          createEvent: { success: 1, __typename: 'Event' },
        }),
      );
    }),
    graphql.query(
      getOperationName(GET_CLIENT_CONFIG) ?? '',
      (req, res, ctx) => {
        return res(
          ctx.data({
            clientConfig: mockedClientConfig,
          }),
        );
      },
    ),
    metadataGraphql.query(
      getOperationName(FIND_MANY_OBJECT_METADATA_ITEMS) ?? '',
      (req, res, ctx) => {
        return res(ctx.data({ objects: mockedObjectMetadataItems }));
      },
    ),
    graphql.query('FindManyViews', (req, res, ctx) => {
      const objectMetadataId = req.variables.filter.objectMetadataId.eq;
      const viewType = req.variables.filter.type.eq;

      return res(
        ctx.data({
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
        }),
      );
    }),
    graphql.query('FindManyViewFields', (req, res, ctx) => {
      const viewId = req.variables.filter.view.eq;

      return res(
        ctx.data({
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
        }),
      );
    }),
    graphql.query('FindManyCompanies', (req, res, ctx) => {
      return res(
        ctx.data({
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
        }),
      );
    }),
    graphql.query('FindManyPipelineSteps', (req, res, ctx) => {
      return res(
        ctx.data({
          pipelineSteps: {
            edges: mockedPipelineSteps.map((data) => ({
              node: data,
              cursor: null,
            })),
            pageInfo: {
              hasNextPage: false,
              hasPreviousPage: false,
              startCursor: null,
              endCursor: null,
            },
          },
        }),
      );
    }),
    graphql.query('FindManyPeople', (req, res, ctx) => {
      return res(
        ctx.data({
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
        }),
      );
    }),
    graphql.query('FindManyActivities', (req, res, ctx) => {
      return res(
        ctx.data({
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
        }),
      );
    }),
  ],
};

import { getOperationName } from '@apollo/client/utilities';
import { graphql } from 'msw';

import { CREATE_ACTIVITY_WITH_COMMENT } from '@/activities/graphql/mutations/createActivityWithComment';
import { GET_ACTIVITIES } from '@/activities/graphql/queries/getActivities';
import { CREATE_EVENT } from '@/analytics/graphql/queries/createEvent';
import { GET_CLIENT_CONFIG } from '@/client-config/graphql/queries/getClientConfig';
import { INSERT_ONE_COMPANY } from '@/companies/graphql/mutations/insertOneCompany';
import { GET_COMPANIES } from '@/companies/graphql/queries/getCompanies';
import { FIND_MANY_METADATA_OBJECTS } from '@/object-metadata/graphql/queries';
import { INSERT_ONE_PERSON } from '@/people/graphql/mutations/insertOnePerson';
import { UPDATE_ONE_PERSON } from '@/people/graphql/mutations/updateOnePerson';
import { GET_PEOPLE } from '@/people/graphql/queries/getPeople';
import { GET_PERSON } from '@/people/graphql/queries/getPerson';
import { GET_PIPELINE_PROGRESS } from '@/pipeline/graphql/queries/getPipelineProgress';
import { GET_PIPELINES } from '@/pipeline/graphql/queries/getPipelines';
import { SEARCH_ACTIVITY_QUERY } from '@/search/graphql/queries/searchActivityQuery';
import { SEARCH_COMPANY_QUERY } from '@/search/graphql/queries/searchCompanyQuery';
import { SEARCH_PEOPLE_QUERY } from '@/search/graphql/queries/searchPeopleQuery';
import { SEARCH_USER_QUERY } from '@/search/graphql/queries/searchUserQuery';
import { GET_API_KEY } from '@/settings/developers/graphql/queries/getApiKey';
import { GET_API_KEYS } from '@/settings/developers/graphql/queries/getApiKeys';
import { GET_CURRENT_USER } from '@/users/graphql/queries/getCurrentUser';
import {
  ActivityType,
  GetCompaniesQuery,
  GetPeopleQuery,
  GetPersonQuery,
  SearchActivityQuery,
  SearchCompanyQuery,
  SearchPeopleQuery,
  SearchUserQuery,
} from '~/generated/graphql';
import { mockedApiKeys } from '~/testing/mock-data/api-keys';

import { mockedActivities, mockedTasks } from './mock-data/activities';
import {
  mockedCompaniesData,
  mockedEmptyCompanyData,
} from './mock-data/companies';
import { mockedObjectMetadataItems } from './mock-data/metadata';
import { mockedEmptyPersonData, mockedPeopleData } from './mock-data/people';
import { mockedPipelineProgressData } from './mock-data/pipeline-progress';
import { mockedPipelinesData } from './mock-data/pipelines';
import { mockedUsersData } from './mock-data/users';
import { mockedViewFieldsData } from './mock-data/view-fields';
import { mockedViewsData } from './mock-data/views';
import {
  fetchOneFromData,
  filterAndSortData,
  updateOneFromData,
} from './mock-data';

const metadataGraphql = graphql.link(
  `${process.env.REACT_APP_SERVER_BASE_URL}/metadata`,
);

export const graphqlMocks = [
  graphql.query(getOperationName(GET_COMPANIES) ?? '', (req, res, ctx) => {
    const returnedMockedData = filterAndSortData<
      GetCompaniesQuery['companies'][0]
    >(
      mockedCompaniesData,
      req.variables.where,
      req.variables.orderBy,
      req.variables.limit,
    );
    return res(
      ctx.data({
        companies: returnedMockedData,
      }),
    );
  }),
  graphql.query(
    getOperationName(SEARCH_COMPANY_QUERY) ?? '',
    (req, res, ctx) => {
      const returnedMockedData = filterAndSortData<
        SearchCompanyQuery['searchResults'][0]
      >(
        mockedCompaniesData,
        req.variables.where,
        !req.variables.orderBy || Array.isArray(req.variables.orderBy)
          ? req.variables.orderBy
          : [req.variables.orderBy],
        req.variables.limit,
      );
      return res(
        ctx.data({
          searchResults: returnedMockedData,
        }),
      );
    },
  ),
  graphql.query(
    getOperationName(SEARCH_PEOPLE_QUERY) ?? '',
    (req, res, ctx) => {
      const returnedMockedData = filterAndSortData<
        SearchPeopleQuery['searchResults'][0]
      >(
        mockedPeopleData,
        req.variables.where,
        !req.variables.orderBy || Array.isArray(req.variables.orderBy)
          ? req.variables.orderBy
          : [req.variables.orderBy],
        req.variables.limit,
      );
      return res(
        ctx.data({
          searchResults: returnedMockedData,
        }),
      );
    },
  ),
  graphql.query(getOperationName(SEARCH_USER_QUERY) ?? '', (req, res, ctx) => {
    const returnedMockedData = filterAndSortData<
      SearchUserQuery['searchResults'][0]
    >(
      mockedUsersData,
      req.variables.where,
      req.variables.orderBy,
      req.variables.limit,
    );
    return res(
      ctx.data({
        searchResults: returnedMockedData,
      }),
    );
  }),
  graphql.query(
    getOperationName(SEARCH_ACTIVITY_QUERY) ?? '',
    (req, res, ctx) => {
      const returnedMockedData = filterAndSortData<
        SearchActivityQuery['searchResults'][0]
      >(
        mockedActivities,
        req.variables.where,
        !req.variables.orderBy || Array.isArray(req.variables.orderBy)
          ? req.variables.orderBy
          : [req.variables.orderBy],
        req.variables.limit,
      );
      return res(
        ctx.data({
          searchResults: returnedMockedData,
        }),
      );
    },
  ),
  graphql.query(getOperationName(GET_CURRENT_USER) ?? '', (req, res, ctx) => {
    return res(
      ctx.data({
        currentUser: mockedUsersData[0],
      }),
    );
  }),
  graphql.query(getOperationName(GET_PERSON) ?? '', (req, res, ctx) => {
    const returnedMockedData = fetchOneFromData<
      GetPersonQuery['findUniquePerson']
    >(mockedPeopleData, req.variables.id);
    return res(
      ctx.data({
        findUniquePerson: returnedMockedData,
      }),
    );
  }),
  graphql.query(getOperationName(GET_PEOPLE) ?? '', (req, res, ctx) => {
    const returnedMockedData = filterAndSortData<GetPeopleQuery['people'][0]>(
      mockedPeopleData,
      req.variables.where,
      req.variables.orderBy,
      req.variables.limit,
    );
    return res(
      ctx.data({
        people: returnedMockedData,
      }),
    );
  }),
  graphql.mutation(
    getOperationName(UPDATE_ONE_PERSON) ?? '',
    (req, res, ctx) => {
      const updatedCompanyId = req.variables.data?.company?.connect?.id;
      const updatedCompany = mockedCompaniesData.find(
        ({ id }) => id === updatedCompanyId,
      );
      const updatedCompanyData = updatedCompany
        ? {
            companyId: updatedCompany.id,
            company: {
              id: updatedCompany.id,
              name: updatedCompany.name,
              domainName: updatedCompany.domainName,
              __typename: 'Company',
            },
          }
        : {};
      return res(
        ctx.data({
          updateOnePerson: {
            ...updateOneFromData(
              mockedPeopleData,
              req.variables.where.id,
              req.variables,
            ),
            ...updatedCompanyData,
          },
        }),
      );
    },
  ),
  graphql.query(getOperationName(GET_PIPELINES) ?? '', (req, res, ctx) => {
    return res(
      ctx.data({
        findManyPipeline: mockedPipelinesData,
      }),
    );
  }),
  graphql.query(
    getOperationName(GET_PIPELINE_PROGRESS) ?? '',
    (req, res, ctx) => {
      return res(
        ctx.data({
          findManyPipelineProgress: mockedPipelineProgressData,
        }),
      );
    },
  ),
  graphql.mutation(getOperationName(CREATE_EVENT) ?? '', (req, res, ctx) => {
    return res(
      ctx.data({
        createEvent: { success: 1, __typename: 'Event' },
      }),
    );
  }),
  graphql.query(getOperationName(GET_CLIENT_CONFIG) ?? '', (req, res, ctx) => {
    return res(
      ctx.data({
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
      }),
    );
  }),
  graphql.query(getOperationName(GET_ACTIVITIES) ?? '', (req, res, ctx) => {
    return res(
      ctx.data({
        findManyActivities:
          req?.variables?.where?.type?.equals === ActivityType.Task
            ? mockedTasks
            : mockedActivities,
      }),
    );
  }),

  graphql.query(getOperationName(GET_API_KEY) ?? '', (req, res, ctx) => {
    return res(
      ctx.data({
        findManyApiKey: [mockedApiKeys[0]],
      }),
    );
  }),
  graphql.query(getOperationName(GET_API_KEYS) ?? '', (req, res, ctx) => {
    return res(
      ctx.data({
        findManyApiKey: mockedApiKeys,
      }),
    );
  }),
  graphql.mutation(
    getOperationName(CREATE_ACTIVITY_WITH_COMMENT) ?? '',
    (req, res, ctx) => {
      return res(
        ctx.data({
          createOneActivity: mockedTasks[0],
        }),
      );
    },
  ),
  graphql.mutation(
    getOperationName(INSERT_ONE_COMPANY) ?? '',
    (req, res, ctx) => {
      return res(
        ctx.data({
          createOneCompany: {
            ...mockedEmptyCompanyData,
            ...req.variables.data,
          },
        }),
      );
    },
  ),
  graphql.mutation(
    getOperationName(INSERT_ONE_PERSON) ?? '',
    (req, res, ctx) => {
      return res(
        ctx.data({
          createOnePerson: {
            ...mockedEmptyPersonData,
            ...req.variables.data,
          },
        }),
      );
    },
  ),
  metadataGraphql.query(
    getOperationName(FIND_MANY_METADATA_OBJECTS) ?? '',
    (req, res, ctx) => {
      return res(ctx.data({ objects: mockedObjectMetadataItems }));
    },
  ),
  graphql.query('FindManyViewsV2', (req, res, ctx) => {
    const objectMetadataId = req.variables.filter.objectMetadataId.eq;
    const viewType = req.variables.filter.type.eq;

    return res(
      ctx.data({
        viewsV2: {
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
  graphql.query('FindManyViewFieldsV2', (req, res, ctx) => {
    const viewId = req.variables.filter.view.eq;

    return res(
      ctx.data({
        viewFieldsV2: {
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
];

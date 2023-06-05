import { graphql } from 'msw';

import { GraphqlQueryCompany } from '@/companies/interfaces/company.interface';
import { GraphqlQueryPerson } from '@/people/interfaces/person.interface';
import { GraphqlQueryUser } from '@/users/interfaces/user.interface';

import {
  GetCompanyCountsQuery,
  GetPeopleCountsQuery,
} from '../generated/graphql';

import { mockedCompaniesData } from './mock-data/companies';
import { mockedPeopleData } from './mock-data/people';
import { mockedUsersData } from './mock-data/users';
import { filterAndSortData, updateOneFromData } from './mock-data';

export const graphqlMocks = [
  graphql.query('GetCompanies', (req, res, ctx) => {
    const returnedMockedData = filterAndSortData<GraphqlQueryCompany>(
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
  graphql.query('SearchCompanyQuery', (req, res, ctx) => {
    const returnedMockedData = filterAndSortData<GraphqlQueryCompany>(
      mockedCompaniesData,
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
  graphql.query('SearchUserQuery', (req, res, ctx) => {
    const returnedMockedData = filterAndSortData<GraphqlQueryUser>(
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
  graphql.query('GetCurrentUser', (req, res, ctx) => {
    const customWhere = {
      ...req.variables.where,
      id: {
        equals: req.variables.uuid,
      },
    };

    const returnedMockedData = filterAndSortData<GraphqlQueryUser>(
      mockedUsersData,
      customWhere,
      req.variables.orderBy,
      req.variables.limit,
    );
    return res(
      ctx.data({
        users: returnedMockedData,
      }),
    );
  }),
  graphql.query('GetPeople', (req, res, ctx) => {
    const returnedMockedData = filterAndSortData<GraphqlQueryPerson>(
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
  graphql.mutation('UpdatePeople', (req, res, ctx) => {
    return res(
      ctx.data({
        updateOnePerson: updateOneFromData(
          mockedPeopleData,
          req.variables.id,
          req.variables,
        ),
      }),
    );
  }),
  graphql.query('GetPeopleCounts', (req, res, ctx) => {
    const mockedData: GetPeopleCountsQuery = {
      people: [{ commentsCount: 12 }],
    };
    return res(ctx.data(mockedData));
  }),

  graphql.query('GetCompanyCounts', (req, res, ctx) => {
    const mockedData: GetCompanyCountsQuery = {
      companies: [{ commentsCount: 20 }],
    };
    return res(ctx.data(mockedData));
  }),
];

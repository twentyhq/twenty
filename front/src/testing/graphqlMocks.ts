import { graphql } from 'msw';

import { GraphqlQueryCompany } from '@/companies/interfaces/company.interface';
import { GraphqlQueryPerson } from '@/people/interfaces/person.interface';
import { GraphqlQueryUser } from '@/users/interfaces/user.interface';

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
  graphql.query('SearchCompany', (req, res, ctx) => {
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
  graphql.query('SearchUser', (req, res, ctx) => {
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
];

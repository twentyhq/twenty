import { graphql } from 'msw';
import { filterAndSortData, updateOneFromData } from './mock-data';
import { GraphqlQueryCompany } from '../interfaces/entities/company.interface';
import { mockedCompaniesData } from './mock-data/companies';
import { GraphqlQueryUser } from '../interfaces/entities/user.interface';
import { mockedUsersData } from './mock-data/users';
import { mockedPeopleData } from './mock-data/people';
import { GraphqlQueryPerson } from '../interfaces/entities/person.interface';

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
];

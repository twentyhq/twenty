import { graphql } from 'msw';
import { RecoilRoot } from 'recoil';
import { MemoryRouter } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';

import { filterAndSortData } from '../../../testing/mock-data';
import { mockedCompaniesData } from '../../../testing/mock-data/companies';
import { GraphqlQueryCompany } from '../../../interfaces/entities/company.interface';

import { FullHeightStorybookLayout } from '../../../testing/FullHeightStorybookLayout';
import { mockedClient } from '../../../testing/mockedClient';
import Companies from '../Companies';
import { GraphqlQueryUser } from '../../../interfaces/entities/user.interface';
import { mockedUsersData } from '../../../testing/mock-data/users';

export const mocks = [
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
];

export function render() {
  return (
    <RecoilRoot>
      <ApolloProvider client={mockedClient}>
        <MemoryRouter>
          <FullHeightStorybookLayout>
            <Companies />
          </FullHeightStorybookLayout>
        </MemoryRouter>
      </ApolloProvider>
    </RecoilRoot>
  );
}

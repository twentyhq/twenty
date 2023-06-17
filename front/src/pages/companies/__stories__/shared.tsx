import { MemoryRouter } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { graphql } from 'msw';
import { RecoilRoot } from 'recoil';

import { GraphqlQueryCompany } from '@/companies/interfaces/company.interface';
import { GraphqlQueryUser } from '@/users/interfaces/user.interface';
import { FullHeightStorybookLayout } from '~/testing/FullHeightStorybookLayout';
import { filterAndSortData } from '~/testing/mock-data';
import { mockedCompaniesData } from '~/testing/mock-data/companies';
import { mockedUsersData } from '~/testing/mock-data/users';
import { mockedClient } from '~/testing/mockedClient';

import { Companies } from '../Companies';

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

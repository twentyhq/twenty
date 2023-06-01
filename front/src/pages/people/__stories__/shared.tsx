import { graphql } from 'msw';
import { RecoilRoot } from 'recoil';
import { MemoryRouter } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';

import { filterAndSortData } from '../../../testing/mock-data';
import { mockedPeopleData } from '../../../testing/mock-data/people';
import { mockedCompaniesData } from '../../../testing/mock-data/companies';
import { GraphqlQueryCompany } from '../../../interfaces/entities/company.interface';
import { GraphqlQueryPerson } from '../../../interfaces/entities/person.interface';

import { FullHeightStorybookLayout } from '../../../testing/FullHeightStorybookLayout';
import { mockedClient } from '../../../testing/mockedClient';
import People from '../People';

export const mocks = [
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
];

export function render() {
  return (
    <RecoilRoot>
      <ApolloProvider client={mockedClient}>
        <MemoryRouter>
          <FullHeightStorybookLayout>
            <People />
          </FullHeightStorybookLayout>
        </MemoryRouter>
      </ApolloProvider>
    </RecoilRoot>
  );
}

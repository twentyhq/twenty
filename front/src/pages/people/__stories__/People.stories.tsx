import { expect } from '@storybook/jest';
import type { Meta, StoryObj } from '@storybook/react';
import { RecoilRoot } from 'recoil';
import { ThemeProvider } from '@emotion/react';
import { MemoryRouter } from 'react-router-dom';
import { graphql } from 'msw';
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import { userEvent, within } from '@storybook/testing-library';

import People from '../People';
import { lightTheme } from '../../../layout/styles/themes';
import { FullHeightStorybookLayout } from '../../../testing/FullHeightStorybookLayout';
import { filterAndSortData } from '../../../testing/mock-data';
import { GraphqlQueryPerson } from '../../../interfaces/entities/person.interface';
import { mockedPeopleData } from '../../../testing/mock-data/people';
import { GraphqlQueryCompany } from '../../../interfaces/entities/company.interface';
import { mockCompaniesData } from '../../../testing/mock-data/companies';

const meta: Meta<typeof People> = {
  title: 'Pages/People',
  component: People,
};

const mockedClient = new ApolloClient({
  uri: process.env.REACT_APP_API_URL,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'all',
    },
  },
});

export default meta;
type Story = StoryObj<typeof People>;

const render = () => (
  <RecoilRoot>
    <ApolloProvider client={mockedClient}>
      <ThemeProvider theme={lightTheme}>
        <MemoryRouter>
          <FullHeightStorybookLayout>
            <People />
          </FullHeightStorybookLayout>
        </MemoryRouter>
      </ThemeProvider>
    </ApolloProvider>
  </RecoilRoot>
);

const defaultMocks = [
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
  graphql.query('SearchQuery', (req, res, ctx) => {
    const returnedMockedData = filterAndSortData<GraphqlQueryCompany>(
      mockCompaniesData,
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

export const Default: Story = {
  render,
  parameters: {
    msw: defaultMocks,
  },
};

export const FilterByEmail: Story = {
  render,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const filterButton = canvas.getByText('Filter');
    await userEvent.click(filterButton);

    const emailFilterButton = canvas.getByText('Email', { selector: 'li' });
    await userEvent.click(emailFilterButton);

    const emailInput = canvas.getByPlaceholderText('Email');
    await userEvent.type(emailInput, 'al', {
      delay: 200,
    });

    await expect(canvas.queryAllByText('John')).toStrictEqual([]);
  },
  parameters: {
    msw: defaultMocks,
  },
};

import { MemoryRouter } from 'react-router-dom';
import Companies from '../Companies';
import { ThemeProvider } from '@emotion/react';
import { lightTheme } from '../../../layout/styles/themes';
import { GET_COMPANIES } from '../../../services/api/companies';
import { mockCompaniesData } from '../__tests__/__data__/mock-data';
import { MockedProvider } from '@apollo/client/testing';
import { SEARCH_COMPANY_QUERY } from '../../../services/api/search/search';
import { mockCompanySearchData } from '../../../services/api/search/__data__/mock-search-data';

const component = {
  title: 'Companies',
  component: Companies,
};

export default component;

const mocks = [
  {
    request: {
      query: GET_COMPANIES,
      variables: {
        orderBy: [{ created_at: 'desc' }],
        where: {},
      },
    },
    result: {
      data: {
        companies: mockCompaniesData,
      },
    },
  },
  {
    request: {
      query: GET_COMPANIES,
      variables: {
        orderBy: [{ created_at: 'desc' }],
        where: {},
      },
    },
    result: {
      data: {
        companies: mockCompaniesData,
      },
    },
  },
  {
    request: {
      query: SEARCH_COMPANY_QUERY,
      variables: { where: { name: { _ilike: '%%' } }, limit: 5 },
    },
    result: mockCompanySearchData,
  },
  {
    request: {
      query: GET_COMPANIES,
      variables: {
        orderBy: [{ created_at: 'desc' }],
        where: { domain_name: { _eq: 'linkedin-searched.com' } },
      },
    },
    result: {
      data: {
        companies: mockCompaniesData,
      },
    },
  },
];

export const CompaniesDefault = () => (
  <MockedProvider mocks={mocks}>
    <ThemeProvider theme={lightTheme}>
      <MemoryRouter>
        <Companies />
      </MemoryRouter>
    </ThemeProvider>
  </MockedProvider>
);

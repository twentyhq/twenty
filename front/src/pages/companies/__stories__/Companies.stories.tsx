import { MemoryRouter } from 'react-router-dom';
import Companies from '../Companies';
import { ThemeProvider } from '@emotion/react';
import { lightTheme } from '../../../layout/styles/themes';
import { GET_COMPANIES } from '../../../services/companies';
import { mockCompanyData } from './mock-data';
import { MockedProvider } from '@apollo/client/testing';

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
        orderBy: [{ name: 'asc' }],
      },
    },
    result: {
      data: {
        companies: mockCompanyData,
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

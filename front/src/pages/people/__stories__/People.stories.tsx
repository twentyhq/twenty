import { MemoryRouter } from 'react-router-dom';
import People from '../People';
import { ThemeProvider } from '@emotion/react';
import { lightTheme } from '../../../layout/styles/themes';
import { MockedProvider } from '@apollo/client/testing';
import { mockData } from '../__tests__/__data__/mock-data';
import { GET_PEOPLE } from '../../../services/people';
import { SEARCH_PEOPLE_QUERY } from '../../../services/search/search';

const component = {
  title: 'People',
  component: People,
};

export default component;

const mocks = [
  {
    request: {
      query: GET_PEOPLE,
      variables: {
        orderBy: [{ created_at: 'desc' }],
        where: {},
      },
    },
    result: {
      data: {
        people: mockData,
      },
    },
  },
  {
    request: {
      query: SEARCH_PEOPLE_QUERY, // TODO this should not be called for empty filters
      variables: {
        where: undefined,
      },
    },
    result: {
      data: {
        people: [],
      },
    },
  },
];

export const PeopleDefault = () => (
  <MockedProvider mocks={mocks}>
    <ThemeProvider theme={lightTheme}>
      <MemoryRouter>
        <People />
      </MemoryRouter>
    </ThemeProvider>
  </MockedProvider>
);

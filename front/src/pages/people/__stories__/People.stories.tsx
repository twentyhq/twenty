import { MemoryRouter } from 'react-router-dom';
import People from '../People';
import { ThemeProvider } from '@emotion/react';
import { lightTheme } from '../../../layout/styles/themes';
import { MockedProvider } from '@apollo/client/testing';
import { mockPeopleData } from '../__tests__/__data__/mock-data';
import { GET_PEOPLE } from '../../../services/api/people';
import { SEARCH_PEOPLE_QUERY } from '../../../services/api/search/search';
import {
  GraphqlMutationPerson,
  GraphqlQueryPerson,
} from '../../../interfaces/entities/person.interface';

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
        orderBy: [{ createdAt: 'desc' }],
        where: {},
      },
    },
    result: {
      data: {
        people: mockPeopleData,
      },
    },
  },
  {
    request: {
      query: GET_PEOPLE,
      variables: {
        orderBy: [{ createdAt: 'desc' }],
        where: {},
      },
    },
    result: {
      data: {
        people: mockPeopleData,
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

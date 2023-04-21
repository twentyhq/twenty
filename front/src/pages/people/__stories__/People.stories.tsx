import { MemoryRouter } from 'react-router-dom';
import People, { GET_PEOPLE } from '../People';
import { ThemeProvider } from '@emotion/react';
import { lightTheme } from '../../../layout/styles/themes';
import { MockedProvider } from '@apollo/client/testing';
import { defaultData } from '../default-data';

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
      },
    },
    result: {
      data: {
        people: defaultData,
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

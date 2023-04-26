import { MemoryRouter } from 'react-router-dom';
import People from '../People';
import { ThemeProvider } from '@emotion/react';
import { lightTheme } from '../../../layout/styles/themes';
import { MockedProvider } from '@apollo/client/testing';
import { defaultData } from '../default-data';
import { GET_PEOPLE } from '../../../services/people';

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

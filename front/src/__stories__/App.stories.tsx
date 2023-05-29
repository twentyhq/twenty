import type { Meta, StoryObj } from '@storybook/react';
import { RecoilRoot } from 'recoil';
import { ThemeProvider } from '@emotion/react';
import { MemoryRouter } from 'react-router-dom';
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';

import App from '../App';
import { FullHeightStorybookLayout } from '../testing/FullHeightStorybookLayout';
import { lightTheme } from '../layout/styles/themes';

const meta: Meta<typeof App> = {
  title: 'App/App',
  component: App,
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
type Story = StoryObj<typeof App>;

const render = () => (
  <RecoilRoot>
    <ApolloProvider client={mockedClient}>
      <ThemeProvider theme={lightTheme}>
        <MemoryRouter>
          <FullHeightStorybookLayout>
            <App />
          </FullHeightStorybookLayout>
        </MemoryRouter>
      </ThemeProvider>
    </ApolloProvider>
  </RecoilRoot>
);

export const Default: Story = {
  render,
  loaders: [
    async () => ({
      accessTokenStored: await window.localStorage.setItem(
        'accessToken',
        'test-token',
      ),
    }),
  ],
};

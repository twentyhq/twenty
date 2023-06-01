import type { Meta, StoryObj } from '@storybook/react';
import { RecoilRoot } from 'recoil';
import { MemoryRouter } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';

import App from '../App';
import { FullHeightStorybookLayout } from '../testing/FullHeightStorybookLayout';
import { mockedClient } from '../testing/mockedClient';
import { graphqlMocks } from '../testing/graphqlMocks';
import { mockedUserJWT } from '../testing/mock-data/jwt';

const meta: Meta<typeof App> = {
  title: 'App/App',
  component: App,
};

export default meta;
type Story = StoryObj<typeof App>;

const render = () => (
  <RecoilRoot>
    <ApolloProvider client={mockedClient}>
      <MemoryRouter>
        <FullHeightStorybookLayout>
          <App />
        </FullHeightStorybookLayout>
      </MemoryRouter>
    </ApolloProvider>
  </RecoilRoot>
);

export const Default: Story = {
  render,
  loaders: [
    async () => ({
      accessTokenStored: window.localStorage.setItem(
        'accessToken',
        mockedUserJWT,
      ),
    }),
  ],
  parameters: {
    msw: graphqlMocks,
  },
};

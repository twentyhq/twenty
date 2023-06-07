import { MemoryRouter } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import type { Meta, StoryObj } from '@storybook/react';
import { RecoilRoot } from 'recoil';

import { themeEnabledState } from '@/ui/layout/states/themeEnabledState';
import { App } from '~/App';
import { AppThemeProvider } from '~/providers/AppThemeProvider';
import { AuthProvider } from '~/providers/AuthProvider';
import { FullHeightStorybookLayout } from '~/testing/FullHeightStorybookLayout';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedUserJWT } from '~/testing/mock-data/jwt';
import { mockedClient } from '~/testing/mockedClient';

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
          <AuthProvider>
            <App />
          </AuthProvider>
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

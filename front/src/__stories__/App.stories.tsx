import { MemoryRouter } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { ThemeProvider } from '@emotion/react';
import type { Meta, StoryObj } from '@storybook/react';
import { RecoilRoot } from 'recoil';

import { lightTheme } from '@/ui/layout/styles/themes';
import { App } from '~/App';
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

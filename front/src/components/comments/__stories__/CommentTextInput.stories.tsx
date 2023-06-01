import type { Meta, StoryObj } from '@storybook/react';
import { RecoilRoot } from 'recoil';
import { ThemeProvider } from '@emotion/react';
import { MemoryRouter } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';

const meta: Meta<typeof App> = {
  title: 'App/App',
  component: App,
};

export default meta;
type Story = StoryObj<typeof App>;

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

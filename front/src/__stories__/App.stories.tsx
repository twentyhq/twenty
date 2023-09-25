import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import { Meta, StoryObj } from '@storybook/react';

import { ClientConfigProvider } from '@/client-config/components/ClientConfigProvider';
import { UserProvider } from '@/users/components/UserProvider';
import { App } from '~/App';
import { FullHeightStorybookLayout } from '~/testing/FullHeightStorybookLayout';
import { graphqlMocks } from '~/testing/graphqlMocks';

const meta: Meta<typeof App> = {
  title: 'App/App',
  component: App,
  decorators: [
    (Story) => (
      <ClientConfigProvider>
        <UserProvider>
          <MemoryRouter>
            <FullHeightStorybookLayout>
              <HelmetProvider>
                <Story />
              </HelmetProvider>
            </FullHeightStorybookLayout>
          </MemoryRouter>
        </UserProvider>
      </ClientConfigProvider>
    ),
  ],
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;
export type Story = StoryObj<typeof App>;

export const Default: Story = {};

export const DarkMode: Story = {
  parameters: {
    theming: {
      themeOverride: 'dark',
    },
  },
};

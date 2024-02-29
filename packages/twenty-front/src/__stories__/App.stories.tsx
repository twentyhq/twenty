import { HelmetProvider } from 'react-helmet-async';
import { Meta, StoryObj } from '@storybook/react';

import { ClientConfigProvider } from '@/client-config/components/ClientConfigProvider';
import { ObjectMetadataItemsProvider } from '@/object-metadata/components/ObjectMetadataItemsProvider';
import { SnackBarProviderScope } from '@/ui/feedback/snack-bar-manager/scopes/SnackBarProviderScope';
import { UserProvider } from '@/users/components/UserProvider';
import { App } from '~/App';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { FullHeightStorybookLayout } from '~/testing/FullHeightStorybookLayout';
import { graphqlMocks } from '~/testing/graphqlMocks';

const meta: Meta<typeof App> = {
  title: 'App/App',
  component: App,
  decorators: [
    MemoryRouterDecorator,
    (Story) => (
      <ClientConfigProvider>
        <UserProvider>
          <FullHeightStorybookLayout>
            <HelmetProvider>
              <SnackBarProviderScope snackBarManagerScopeId="snack-bar-manager">
                <ObjectMetadataItemsProvider>
                  <Story />
                </ObjectMetadataItemsProvider>
              </SnackBarProviderScope>
            </HelmetProvider>
          </FullHeightStorybookLayout>
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

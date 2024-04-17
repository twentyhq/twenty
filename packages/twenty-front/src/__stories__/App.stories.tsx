import { HelmetProvider } from 'react-helmet-async';
import { getOperationName } from '@apollo/client/utilities';
import { Meta, StoryObj } from '@storybook/react';
import { graphql, HttpResponse } from 'msw';
import { IconsProvider } from 'twenty-ui';

import { ClientConfigProvider } from '@/client-config/components/ClientConfigProvider';
import { ClientConfigProviderEffect } from '@/client-config/components/ClientConfigProviderEffect';
import { ObjectMetadataItemsProvider } from '@/object-metadata/components/ObjectMetadataItemsProvider';
import { SnackBarProvider } from '@/ui/feedback/snack-bar-manager/components/SnackBarProvider';
import { SnackBarProviderScope } from '@/ui/feedback/snack-bar-manager/scopes/SnackBarProviderScope';
import { AppThemeProvider } from '@/ui/theme/components/AppThemeProvider';
import { UserProvider } from '@/users/components/UserProvider';
import { UserProviderEffect } from '@/users/components/UserProviderEffect';
import { GET_CURRENT_USER } from '@/users/graphql/queries/getCurrentUser';
import { App } from '~/App';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { FullHeightStorybookLayout } from '~/testing/FullHeightStorybookLayout';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedUsersData } from '~/testing/mock-data/users';

const meta: Meta<typeof App> = {
  title: 'App/App',
  component: App,
  decorators: [
    MemoryRouterDecorator,
    (Story) => (
      <>
        <SnackBarProviderScope snackBarManagerScopeId="snack-bar-manager">
          <ClientConfigProviderEffect />
          <ClientConfigProvider>
            <UserProviderEffect />
            <UserProvider>
              <FullHeightStorybookLayout>
                <ObjectMetadataItemsProvider>
                  <IconsProvider>
                    <HelmetProvider>
                      <SnackBarProvider>
                        <AppThemeProvider>
                          <SnackBarProviderScope snackBarManagerScopeId="snack-bar-manager">
                            <ObjectMetadataItemsProvider>
                              <Story />
                            </ObjectMetadataItemsProvider>
                          </SnackBarProviderScope>
                        </AppThemeProvider>
                      </SnackBarProvider>
                    </HelmetProvider>
                  </IconsProvider>
                </ObjectMetadataItemsProvider>
              </FullHeightStorybookLayout>
            </UserProvider>
          </ClientConfigProvider>
        </SnackBarProviderScope>
      </>
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
    msw: {
      handlers: [
        ...graphqlMocks.handlers.filter((handler) => {
          return (handler.info as any).operationName !== 'GetCurrentUser';
        }),
        graphql.query(getOperationName(GET_CURRENT_USER) ?? '', () => {
          return HttpResponse.json({
            data: {
              currentUser: {
                ...mockedUsersData[0],
                workspaceMember: {
                  ...mockedUsersData[0].workspaceMember,
                  colorScheme: 'Dark',
                },
              },
            },
          });
        }),
      ],
    },
  },
};

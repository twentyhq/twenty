import { getOperationName } from '@apollo/client/utilities';
import { jest } from '@storybook/jest';
import { Meta, StoryObj } from '@storybook/react';
import { graphql, HttpResponse } from 'msw';
import { HelmetProvider } from 'react-helmet-async';
import { RecoilRoot } from 'recoil';
import { IconsProvider } from 'twenty-ui';

import { AppErrorBoundary } from '@/error-handler/components/AppErrorBoundary';
import indexAppPath from '@/navigation/utils/indexAppPath';
import { AppPath } from '@/types/AppPath';
import { SnackBarProviderScope } from '@/ui/feedback/snack-bar-manager/scopes/SnackBarProviderScope';
import { GET_CURRENT_USER } from '@/users/graphql/queries/getCurrentUser';

import { AppRouter } from '@/app/components/AppRouter';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedUserData } from '~/testing/mock-data/users';

const meta: Meta<typeof AppRouter> = {
  title: 'App/AppRouter',
  component: AppRouter,
  decorators: [
    (Story) => {
      return (
        <RecoilRoot>
          <AppErrorBoundary>
            <SnackBarProviderScope snackBarManagerScopeId="snack-bar-manager">
              <IconsProvider>
                <HelmetProvider>
                  <Story />
                </HelmetProvider>
              </IconsProvider>
            </SnackBarProviderScope>
          </AppErrorBoundary>
        </RecoilRoot>
      );
    },
  ],
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;
export type Story = StoryObj<typeof AppRouter>;

export const Default: Story = {
  play: async () => {
    jest
      .spyOn(indexAppPath, 'getIndexAppPath')
      .mockReturnValue('iframe.html' as AppPath);
  },
};

export const DarkMode: Story = {
  play: async () => {
    jest
      .spyOn(indexAppPath, 'getIndexAppPath')
      .mockReturnValue('iframe.html' as AppPath);
  },
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
                ...mockedUserData,
                workspaceMember: {
                  ...mockedUserData.workspaceMember,
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

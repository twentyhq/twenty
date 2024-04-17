import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { loadDevMessages } from '@apollo/client/dev';
import { Decorator } from '@storybook/react';
import { RecoilRoot } from 'recoil';

import { ClientConfigProviderEffect } from '@/client-config/components/ClientConfigProviderEffect';
import { ObjectMetadataItemsProvider } from '@/object-metadata/components/ObjectMetadataItemsProvider';
import { ApolloMetadataClientMockedProvider } from '@/object-metadata/hooks/__mocks__/ApolloMetadataClientProvider';
import { SnackBarProviderScope } from '@/ui/feedback/snack-bar-manager/scopes/SnackBarProviderScope';
import { UserProviderEffect } from '@/users/components/UserProviderEffect';
import { ClientConfigProvider } from '~/modules/client-config/components/ClientConfigProvider';
import { DefaultLayout } from '~/modules/ui/layout/page/DefaultLayout';
import { UserProvider } from '~/modules/users/components/UserProvider';
import { mockedApolloClient } from '~/testing/mockedApolloClient';

import { FullHeightStorybookLayout } from '../FullHeightStorybookLayout';

export type PageDecoratorArgs = {
  routePath: string;
  routeParams: RouteParams;
  additionalRoutes?: string[];
};

type RouteParams = {
  [param: string]: string;
};

const computeLocation = (routePath: string, routeParams: RouteParams) => {
  return {
    pathname: routePath.replace(
      /:(\w+)/g,
      (paramName) => routeParams[paramName] ?? '',
    ),
  };
};

const ApolloStorybookDevLogEffect = () => {
  loadDevMessages();

  return <></>;
};

export const PageDecorator: Decorator<{
  routePath: string;
  routeParams: RouteParams;
  additionalRoutes?: string[];
}> = (Story, { args }) => {
  return (
    <RecoilRoot>
      <ApolloProvider client={mockedApolloClient}>
        <ApolloStorybookDevLogEffect />
        <ApolloMetadataClientMockedProvider>
          <UserProviderEffect />
          <UserProvider>
            <ClientConfigProviderEffect />
            <ClientConfigProvider>
              <MemoryRouter
                initialEntries={[
                  computeLocation(args.routePath, args.routeParams),
                ]}
              >
                <FullHeightStorybookLayout>
                  <HelmetProvider>
                    <SnackBarProviderScope snackBarManagerScopeId="snack-bar-manager">
                      <ObjectMetadataItemsProvider>
                        <Routes>
                          <Route element={<DefaultLayout />}>
                            <Route path={args.routePath} element={<Story />} />
                            {args.additionalRoutes?.map((route) => (
                              <Route
                                key={route}
                                path={route}
                                element={<div>Navigated to {route}</div>}
                              />
                            ))}
                          </Route>
                        </Routes>
                      </ObjectMetadataItemsProvider>
                    </SnackBarProviderScope>
                  </HelmetProvider>
                </FullHeightStorybookLayout>
              </MemoryRouter>
            </ClientConfigProvider>
          </UserProvider>
        </ApolloMetadataClientMockedProvider>
      </ApolloProvider>
    </RecoilRoot>
  );
};

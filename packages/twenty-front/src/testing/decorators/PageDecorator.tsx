import { ApolloProvider } from '@apollo/client';
import { loadDevMessages } from '@apollo/client/dev';
import { Decorator } from '@storybook/react';
import { HelmetProvider } from 'react-helmet-async';
import {
  createMemoryRouter,
  createRoutesFromElements,
  Outlet,
  Route,
  RouterProvider,
} from 'react-router-dom';
import { RecoilRoot } from 'recoil';

import { ClientConfigProviderEffect } from '@/client-config/components/ClientConfigProviderEffect';
import { ApolloMetadataClientMockedProvider } from '@/object-metadata/hooks/__mocks__/ApolloMetadataClientMockedProvider';
import { SnackBarProviderScope } from '@/ui/feedback/snack-bar-manager/scopes/SnackBarProviderScope';
import { DefaultLayout } from '@/ui/layout/page/components/DefaultLayout';
import { UserProviderEffect } from '@/users/components/UserProviderEffect';
import { ClientConfigProvider } from '~/modules/client-config/components/ClientConfigProvider';
import { UserProvider } from '~/modules/users/components/UserProvider';
import { mockedApolloClient } from '~/testing/mockedApolloClient';

import { RecoilDebugObserverEffect } from '@/debug/components/RecoilDebugObserver';
import { ObjectMetadataItemsProvider } from '@/object-metadata/components/ObjectMetadataItemsProvider';
import { PrefetchDataProvider } from '@/prefetch/components/PrefetchDataProvider';
import { WorkspaceProviderEffect } from '@/workspace/components/WorkspaceProviderEffect';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { IconsProvider } from 'twenty-ui';
import { dynamicActivate } from '~/utils/i18n/dynamicActivate';
import { FullHeightStorybookLayout } from '../FullHeightStorybookLayout';

export type PageDecoratorArgs = {
  routePath: string;
  routeParams: RouteParams;
  additionalRoutes?: string[];
};

export type RouteParams = {
  [param: string]: string;
};

export const isRouteParams = (obj: any): obj is RouteParams => {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  return Object.keys(obj).every((key) => typeof obj[key] === 'string');
};

export const computeLocation = (
  routePath: string,
  routeParams?: RouteParams,
) => {
  return {
    pathname: routePath.replace(
      /:(\w+)/g,
      (paramName) => routeParams?.[paramName] ?? '',
    ),
  };
};

const ApolloStorybookDevLogEffect = () => {
  loadDevMessages();

  return <></>;
};

dynamicActivate('en');

const Providers = () => {
  return (
    <RecoilRoot>
      <SnackBarProviderScope snackBarManagerScopeId="snack-bar-manager">
        <RecoilDebugObserverEffect />
        <ApolloProvider client={mockedApolloClient}>
          <I18nProvider i18n={i18n}>
            <ApolloStorybookDevLogEffect />
            <ClientConfigProviderEffect />
            <ClientConfigProvider>
              <UserProviderEffect />
              <WorkspaceProviderEffect />
              <UserProvider>
                <ApolloMetadataClientMockedProvider>
                  <ObjectMetadataItemsProvider>
                    <FullHeightStorybookLayout>
                      <HelmetProvider>
                        <SnackBarProviderScope snackBarManagerScopeId="snack-bar-manager">
                          <IconsProvider>
                            <PrefetchDataProvider>
                              <Outlet />
                            </PrefetchDataProvider>
                          </IconsProvider>
                        </SnackBarProviderScope>
                      </HelmetProvider>
                    </FullHeightStorybookLayout>
                  </ObjectMetadataItemsProvider>
                </ApolloMetadataClientMockedProvider>
              </UserProvider>
            </ClientConfigProvider>
          </I18nProvider>
        </ApolloProvider>
      </SnackBarProviderScope>
    </RecoilRoot>
  );
};

const createRouter = ({
  Story,
  args,
  initialEntries,
  initialIndex,
}: {
  Story: () => JSX.Element;
  args: {
    routePath: string;
    routeParams: RouteParams;
    additionalRoutes?: string[] | undefined;
  };
  initialEntries?: {
    pathname: string;
  }[];
  initialIndex?: number;
}) =>
  createMemoryRouter(
    createRoutesFromElements(
      <Route element={<Providers />}>
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
      </Route>,
    ),
    { initialEntries, initialIndex },
  );

export const PageDecorator: Decorator<{
  routePath: string;
  routeParams: RouteParams;
  additionalRoutes?: string[];
}> = (Story, { args }) => {
  return (
    <RouterProvider
      router={createRouter({
        Story,
        args,
        initialEntries: [computeLocation(args.routePath, args.routeParams)],
      })}
    />
  );
};

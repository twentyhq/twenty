import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Decorator } from '@storybook/react';

import { ClientConfigProvider } from '~/modules/client-config/components/ClientConfigProvider';
import { DefaultLayout } from '~/modules/ui/layout/page/DefaultLayout';
import { UserProvider } from '~/modules/users/components/UserProvider';

import { FullHeightStorybookLayout } from '../FullHeightStorybookLayout';

export type PageDecoratorArgs = {
  routePath: string;
  routeParams: RouteParams;
  state?: string;
};

type RouteParams = {
  [param: string]: string;
};

const computeLocation = (
  routePath: string,
  routeParams: RouteParams,
  state?: string,
) => {
  return {
    pathname: routePath.replace(
      /:(\w+)/g,
      (paramName) => routeParams[paramName] ?? '',
    ),
    state,
  };
};

export const PageDecorator: Decorator<{
  routePath: string;
  routeParams: RouteParams;
  state?: string;
}> = (Story, { args }) => (
  <UserProvider>
    <ClientConfigProvider>
      <MemoryRouter
        initialEntries={[
          computeLocation(args.routePath, args.routeParams, args.state),
        ]}
      >
        <FullHeightStorybookLayout>
          <HelmetProvider>
            <DefaultLayout>
              <Routes>
                <Route path={args.routePath} element={<Story />} />
              </Routes>
            </DefaultLayout>
          </HelmetProvider>
        </FullHeightStorybookLayout>
      </MemoryRouter>
    </ClientConfigProvider>
  </UserProvider>
);

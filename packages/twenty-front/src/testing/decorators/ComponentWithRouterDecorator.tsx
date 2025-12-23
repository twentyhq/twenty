import {
  createMemoryRouter,
  createRoutesFromElements,
  Outlet,
  Route,
  RouterProvider,
} from 'react-router-dom';
import { type Decorator } from '@storybook/react';

import {
  computeLocation,
  isRouteParams,
} from '~/testing/decorators/PageDecorator';

import { ComponentStorybookLayout } from '~/testing/ComponentStorybookLayout';

interface StrictArgs {
  [name: string]: unknown;
}

const Providers = () => (
  <ComponentStorybookLayout>
    <Outlet />
  </ComponentStorybookLayout>
);

const createRouter = ({
  Story,
  args,
  initialEntries,
  initialIndex,
}: {
  Story: () => JSX.Element;
  args: StrictArgs;
  initialEntries?: {
    pathname: string;
  }[];
  initialIndex?: number;
}) =>
  createMemoryRouter(
    createRoutesFromElements(
      <Route element={<Providers />}>
        <Route path={(args.routePath as string) ?? '*'} element={<Story />} />
      </Route>,
    ),
    { initialEntries, initialIndex },
  );

export const ComponentWithRouterDecorator: Decorator = (Story, { args }) => {
  return (
    <RouterProvider
      router={createRouter({
        Story,
        args,
        initialEntries:
          args.routePath &&
          typeof args.routePath === 'string' &&
          (args.routeParams === undefined || isRouteParams(args.routeParams))
            ? [computeLocation(args.routePath, args.routeParams)]
            : [{ pathname: '/' }],
      })}
    />
  );
};

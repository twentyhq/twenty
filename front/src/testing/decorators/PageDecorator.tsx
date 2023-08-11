import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Decorator } from '@storybook/react';

import { ClientConfigProvider } from '~/modules/client-config/components/ClientConfigProvider';
import { DefaultLayout } from '~/modules/ui/layout/components/DefaultLayout';
import { UserProvider } from '~/modules/users/components/UserProvider';

import { FullHeightStorybookLayout } from '../FullHeightStorybookLayout';

export type PageDecoratorArgs = { currentPath: string; id: string };

function replacePlaceholder(path: string, id?: string) {
  const matches = path.match(/:[a-zA-Z0-9]+/);

  if (id && matches && matches.length > 0) {
    return path.replace(matches[0], id);
  }

  return path;
}

export const PageDecorator: Decorator<{ currentPath: string; id: string }> = (
  Story,
  { args },
) => (
  <UserProvider>
    <ClientConfigProvider>
      <MemoryRouter
        initialEntries={[replacePlaceholder(args.currentPath, args.id)]}
      >
        <Routes>
          <Route
            path={args.currentPath}
            element={
              <FullHeightStorybookLayout>
                <DefaultLayout>
                  <Story />
                </DefaultLayout>
              </FullHeightStorybookLayout>
            }
          />
        </Routes>
      </MemoryRouter>
    </ClientConfigProvider>
  </UserProvider>
);

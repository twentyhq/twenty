import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Decorator } from '@storybook/react';

import { ClientConfigProvider } from '~/modules/client-config/components/ClientConfigProvider';
import { DefaultLayout } from '~/modules/ui/layout/components/DefaultLayout';
import { UserProvider } from '~/modules/users/components/UserProvider';

import { FullHeightStorybookLayout } from '../FullHeightStorybookLayout';

export type PageDecoratorArgs = { currentPath: string };

export const PageDecorator: Decorator<{ currentPath: string }> = (
  Story,
  { args },
) => (
  <UserProvider>
    <ClientConfigProvider>
      <MemoryRouter initialEntries={[args.currentPath]}>
        <Routes>
          <Route
            path="/companies/:companyId"
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

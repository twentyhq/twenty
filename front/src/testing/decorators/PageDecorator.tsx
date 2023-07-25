import { HotkeysProvider } from 'react-hotkeys-hook';
import { MemoryRouter } from 'react-router-dom';
import { Decorator } from '@storybook/react';

import { ClientConfigProvider } from '../../modules/client-config/components/ClientConfigProvider';
import { INITIAL_HOTKEYS_SCOPES } from '../../modules/ui/hotkey/constants';
import { DefaultLayout } from '../../modules/ui/layout/components/DefaultLayout';
import { UserProvider } from '../../modules/users/components/UserProvider';
import { FullHeightStorybookLayout } from '../FullHeightStorybookLayout';

export type PageDecoratorArgs = { currentPath: string };

export const PageDecorator: Decorator<{ currentPath: string }> = (
  Story,
  { args },
) => (
  <UserProvider>
    <ClientConfigProvider>
      <MemoryRouter initialEntries={[args.currentPath]}>
        <FullHeightStorybookLayout>
          <DefaultLayout>
            <Story />
          </DefaultLayout>
        </FullHeightStorybookLayout>
      </MemoryRouter>
    </ClientConfigProvider>
  </UserProvider>
);

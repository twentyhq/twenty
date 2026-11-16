import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import {
  createMemoryRouter,
  Outlet,
  RouterProvider,
  useLocation,
} from 'react-router-dom';
import { expect, within } from 'storybook/test';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';

import { ErrorMessageEffect } from '@/error-handler/components/ErrorMessageEffect';
import { SettingsLegacyAccountsRedirect } from '@/settings/app-preferences/components/SettingsLegacyAccountsRedirect';
import { APP_PREFERENCES_PATH_BY_LEGACY_ACCOUNTS_PATH } from '@/settings/app-preferences/constants/AppPreferencesPathByLegacyAccountsPath';
import { AppToaster } from '@/ui/feedback/toast/components/AppToaster';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';

type LegacyAccountsRedirectHarnessProps = {
  initialEntry: string;
};

const CurrentLocation = () => {
  const { pathname, search, hash } = useLocation();

  return <span>{`Location ${pathname}${search}${hash}`}</span>;
};

const LegacyAccountsRedirectHarness = ({
  initialEntry,
}: LegacyAccountsRedirectHarnessProps) => {
  const [router] = useState(() =>
    createMemoryRouter(
      [
        {
          element: (
            <>
              <ErrorMessageEffect />
              <AppToaster />
              <Outlet />
            </>
          ),
          children: [
            ...Object.keys(APP_PREFERENCES_PATH_BY_LEGACY_ACCOUNTS_PATH).map(
              (legacyAccountsPath) => ({
                path: `/settings/${legacyAccountsPath}`,
                element: <SettingsLegacyAccountsRedirect />,
              }),
            ),
            {
              path: `${getSettingsPath(SettingsPath.AppPreferences)}/*`,
              element: <CurrentLocation />,
            },
          ],
        },
      ],
      { initialEntries: [initialEntry] },
    ),
  );

  return <RouterProvider router={router} />;
};

const meta: Meta<typeof LegacyAccountsRedirectHarness> = {
  title: 'Modules/Settings/AppPreferences/SettingsLegacyAccountsRedirect',
  component: LegacyAccountsRedirectHarness,
  decorators: [ToastDecorator],
};

export default meta;

type Story = StoryObj<typeof LegacyAccountsRedirectHarness>;

export const ForwardsWithQueryAndHash: Story = {
  args: {
    initialEntry:
      '/settings/accounts/configuration/account-id?tab=emails#calendar',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByText(
        'Location /settings/app-preferences/accounts/account-id/configuration?tab=emails#calendar',
      ),
    ).toBeVisible();
  },
};

export const ForwardsAnAppConnectionReturn: Story = {
  args: {
    initialEntry: '/settings/accounts/applications/application-id#connections',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByText(
        'Location /settings/app-preferences/application-id#connections',
      ),
    ).toBeVisible();
  },
};

export const ForwardsTheAccountsRoot: Story = {
  args: { initialEntry: '/settings/accounts#accounts' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByText('Location /settings/app-preferences#accounts'),
    ).toBeVisible();
  },
};

export const OAuthErrorIsShownOnceAndRemovedFromTheUrl: Story = {
  args: {
    initialEntry:
      '/settings/accounts?errorMessage=Sync%20failed&tab=apps#accounts',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByText(
        'Location /settings/app-preferences?tab=apps#accounts',
      ),
    ).toBeVisible();
    expect(
      await within(document.body).findAllByText('Sync failed'),
    ).toHaveLength(1);
  },
};

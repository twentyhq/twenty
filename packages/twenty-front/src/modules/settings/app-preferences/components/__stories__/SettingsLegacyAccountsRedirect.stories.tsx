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

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { ErrorMessageEffect } from '@/error-handler/components/ErrorMessageEffect';
import { SettingsLegacyAccountsRedirect } from '@/settings/app-preferences/components/SettingsLegacyAccountsRedirect';
import { AppToaster } from '@/ui/feedback/toast/components/AppToaster';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';

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
            {
              element: <SettingsLegacyAccountsRedirect />,
              children: [
                {
                  path: getSettingsPath(SettingsPath.Accounts),
                  element: <span>Legacy accounts page</span>,
                },
                {
                  path: getSettingsPath(SettingsPath.AccountsConfiguration),
                  element: <span>Legacy configuration page</span>,
                },
                {
                  path: getSettingsPath(SettingsPath.ApplicationPreferences),
                  element: <span>Legacy application page</span>,
                },
              ],
            },
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

const setAppPreferencesFlag = (value: boolean) =>
  jotaiStore.set(currentWorkspaceState.atom, {
    ...mockCurrentWorkspace,
    featureFlags: [{ key: FeatureFlagKey.IS_APP_PREFERENCES_ENABLED, value }],
  });

const meta: Meta<typeof LegacyAccountsRedirectHarness> = {
  title: 'Modules/Settings/AppPreferences/SettingsLegacyAccountsRedirect',
  component: LegacyAccountsRedirectHarness,
  decorators: [ToastDecorator],
  beforeEach: () => {
    setAppPreferencesFlag(true);
  },
};

export default meta;

type Story = StoryObj<typeof LegacyAccountsRedirectHarness>;

export const FlagOffKeepsTheLegacyPage: Story = {
  args: { initialEntry: '/settings/accounts/configuration/account-id' },
  beforeEach: () => {
    setAppPreferencesFlag(false);
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Legacy configuration page')).toBeVisible();
  },
};

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

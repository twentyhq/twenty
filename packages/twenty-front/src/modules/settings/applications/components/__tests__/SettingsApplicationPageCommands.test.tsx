import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore } from 'jotai';
import { Route, Routes } from 'react-router-dom';

import { SettingsPageCommandMenu } from '@/command-menu-item/components/SettingsPageCommandMenu';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStorePageCommandsComponentState } from '@/context-store/states/contextStorePageCommandsComponentState';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { SettingsApplicationPageCommands } from '@/settings/applications/components/SettingsApplicationPageCommands';
import { EngineComponentKey } from '~/generated-metadata/graphql';
import { getJestPageCommandsWrapper } from '~/testing/jest/getJestPageCommandsWrapper';
import { mockedCommandMenuItems } from '~/testing/mock-data/generated/metadata/command-menu-items/mock-command-menu-items-data';

jest.mock(
  '@/command-menu-item/display/components/PinnedCommandMenuItemsInlineMeasurements',
  () => ({ PinnedCommandMenuItemsInlineMeasurements: () => null }),
);

const INSTALLED_APPLICATION_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';

type RenderPageCommandsOptions = {
  installedApplicationId?: string;
  canInstallMarketplaceApps?: boolean;
  isInstalling?: boolean;
  installProgress?: number;
};

const renderPageCommands = ({
  installedApplicationId,
  canInstallMarketplaceApps = true,
  isInstalling = false,
  installProgress,
}: RenderPageCommandsOptions) => {
  const store = createStore();
  const onInstall = jest.fn();

  render(
    <Routes>
      <Route
        path="/settings/applications/available"
        element={
          <>
            <SettingsApplicationPageCommands
              installedApplicationId={installedApplicationId}
              canInstallMarketplaceApps={canInstallMarketplaceApps}
              onInstall={onInstall}
              isInstalling={isInstalling}
              installProgress={installProgress}
            />
            <SettingsPageCommandMenu />
          </>
        }
      />
      <Route
        path="/settings/applications/:applicationId"
        element="Application settings"
      />
    </Routes>,
    {
      wrapper: getJestPageCommandsWrapper({
        store,
        initialEntries: ['/settings/applications/available'],
      }),
    },
  );

  const getPageCommands = () =>
    store.get(
      contextStorePageCommandsComponentState.atomFamily({
        instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
      }),
    );

  return { getPageCommands, onInstall, store };
};

describe('SettingsApplicationPageCommands', () => {
  it.each([
    {
      state: 'an app the member cannot install',
      props: { canInstallMarketplaceApps: false },
      expectedCommands: [],
    },
    {
      state: 'an app the member can install',
      props: {},
      expectedCommands: [EngineComponentKey.INSTALL_APPLICATION],
    },
    {
      state: 'an installed app, even without the Workspace Apps permission',
      props: {
        installedApplicationId: INSTALLED_APPLICATION_ID,
        canInstallMarketplaceApps: false,
      },
      expectedCommands: [EngineComponentKey.OPEN_APPLICATION_SETTINGS],
    },
    {
      state: 'an app still installing',
      props: {
        installedApplicationId: INSTALLED_APPLICATION_ID,
        isInstalling: true,
      },
      expectedCommands: [EngineComponentKey.INSTALL_APPLICATION],
    },
  ])('offers $expectedCommands for $state', ({ props, expectedCommands }) => {
    const { getPageCommands } = renderPageCommands(props);

    expect(Object.keys(getPageCommands())).toEqual(expectedCommands);
  });

  it('installs the application from the Install button', async () => {
    const user = userEvent.setup();
    const { onInstall } = renderPageCommands({});

    await user.click(screen.getByRole('button', { name: 'Install' }));

    expect(onInstall).toHaveBeenCalledTimes(1);
  });

  it('keeps pinned global app commands out of the settings header', () => {
    const { store } = renderPageCommands({});

    act(() => {
      store.set(metadataStoreState.atomFamily('commandMenuItems'), {
        current: mockedCommandMenuItems.map((commandMenuItem) =>
          commandMenuItem.engineComponentKey ===
          EngineComponentKey.FRONT_COMPONENT_RENDERER
            ? { ...commandMenuItem, pageLayoutId: null }
            : commandMenuItem,
        ),
        draft: [],
        status: 'up-to-date',
      });
    });

    expect(
      screen.getAllByRole('button').map((button) => button.textContent),
    ).toEqual(['Install']);
  });

  it('shows the install as busy with its progress', () => {
    const { getPageCommands } = renderPageCommands({
      isInstalling: true,
      installProgress: 60,
    });

    expect(
      getPageCommands()[EngineComponentKey.INSTALL_APPLICATION],
    ).toMatchObject({ isLoading: true, progress: 60 });
  });

  it('opens the installed application settings', async () => {
    const { getPageCommands } = renderPageCommands({
      installedApplicationId: INSTALLED_APPLICATION_ID,
    });

    await act(async () => {
      await getPageCommands()[
        EngineComponentKey.OPEN_APPLICATION_SETTINGS
      ]?.run();
    });

    expect(screen.getByText('Application settings')).toBeVisible();
  });
});

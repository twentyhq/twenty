import { act, render, screen } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStorePageCommandsComponentState } from '@/context-store/states/contextStorePageCommandsComponentState';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { SettingsApplicationPageCommands } from '@/settings/applications/components/SettingsApplicationPageCommands';
import { EngineComponentKey } from '~/generated-metadata/graphql';

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

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <JotaiProvider store={store}>
      <ContextStoreComponentInstanceContext.Provider
        value={{ instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID }}
      >
        <MemoryRouter initialEntries={['/settings/applications/available']}>
          <Routes>
            <Route path="/settings/applications/available" element={children} />
            <Route
              path="/settings/applications/:applicationId"
              element="Application settings"
            />
          </Routes>
        </MemoryRouter>
      </ContextStoreComponentInstanceContext.Provider>
    </JotaiProvider>
  );

  render(
    <SettingsApplicationPageCommands
      installedApplicationId={installedApplicationId}
      canInstallMarketplaceApps={canInstallMarketplaceApps}
      onInstall={jest.fn()}
      isInstalling={isInstalling}
      installProgress={installProgress}
    />,
    { wrapper: Wrapper },
  );

  return () =>
    store.get(
      contextStorePageCommandsComponentState.atomFamily({
        instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
      }),
    );
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
    const getPageCommands = renderPageCommands(props);

    expect(Object.keys(getPageCommands())).toEqual(expectedCommands);
  });

  it('shows the install as busy with its progress', () => {
    const getPageCommands = renderPageCommands({
      isInstalling: true,
      installProgress: 60,
    });

    expect(
      getPageCommands()[EngineComponentKey.INSTALL_APPLICATION],
    ).toMatchObject({ isLoading: true, progress: 60 });
  });

  it('opens the installed application settings', async () => {
    const getPageCommands = renderPageCommands({
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

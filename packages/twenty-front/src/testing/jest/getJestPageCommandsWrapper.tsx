import { MockedProvider } from '@apollo/client/testing/react';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { type createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { ToastProvider } from 'twenty-ui/components/feedback';

import { commandMenuPinnedInlineLayoutFamilyState } from '@/command-menu-item/display/states/commandMenuPinnedInlineLayoutFamilyState';
import { getPinnedCommandMenuItemWidthKey } from '@/command-menu-item/display/utils/getPinnedCommandMenuItemWidthKey';
import { CommandRunner } from '@/command-menu-item/engine-command/components/CommandRunner';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { mockedCommandMenuItems } from '~/testing/mock-data/generated/metadata/command-menu-items/mock-command-menu-items-data';

type JotaiStore = ReturnType<typeof createStore>;

export const getJestPageCommandsWrapper = ({
  store,
  initialEntries,
}: {
  store: JotaiStore;
  initialEntries?: string[];
}) => {
  store.set(metadataStoreState.atomFamily('commandMenuItems'), {
    current: mockedCommandMenuItems,
    draft: [],
    status: 'up-to-date',
  });

  store.set(
    commandMenuPinnedInlineLayoutFamilyState.atomFamily('page-header'),
    {
      containerWidth: Number.MAX_SAFE_INTEGER,
      commandMenuItemWidthsByKey: Object.fromEntries(
        mockedCommandMenuItems.flatMap(({ id }) =>
          [true, false].map((shouldShowHotKey) => [
            getPinnedCommandMenuItemWidthKey({
              commandMenuItemId: id,
              shouldShowHotKey,
            }),
            0,
          ]),
        ),
      ),
    },
  );

  return ({ children }: { children: ReactNode }) => (
    <JotaiProvider store={store}>
      <I18nProvider i18n={i18n}>
        <ToastProvider>
          <MockedProvider>
            <MemoryRouter initialEntries={initialEntries}>
              <ContextStoreComponentInstanceContext.Provider
                value={{ instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID }}
              >
                <CommandRunner />
                {children}
              </ContextStoreComponentInstanceContext.Provider>
            </MemoryRouter>
          </MockedProvider>
        </ToastProvider>
      </I18nProvider>
    </JotaiProvider>
  );
};

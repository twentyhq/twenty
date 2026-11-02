import { render, waitFor } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { ToastProvider } from 'twenty-ui/components/feedback';

import { CommandRunner } from '@/command-menu-item/engine-command/components/CommandRunner';
import { headlessCommandContextApisState } from '@/command-menu-item/engine-command/states/headlessCommandContextApisState';
import { type HeadlessCommandContextApi } from '@/command-menu-item/engine-command/types/HeadlessCommandContextApi';
import { type PageCommand } from '@/command-menu-item/page-command/types/PageCommand';
import { contextStorePageCommandsComponentState } from '@/context-store/states/contextStorePageCommandsComponentState';
import { EngineComponentKey } from '~/generated-metadata/graphql';

const COMMAND_MENU_ITEM_ID = 'save-page-command-menu-item';
const CONTEXT_STORE_INSTANCE_ID = 'side-panel-settings-page';

const renderMountedPageCommand = (
  pageCommand: Omit<PageCommand, 'registrationId'>,
) => {
  const store = createStore();

  store.set(
    headlessCommandContextApisState.atom,
    new Map([
      [
        COMMAND_MENU_ITEM_ID,
        {
          engineComponentKey: EngineComponentKey.SAVE_PAGE,
          contextStoreInstanceId: CONTEXT_STORE_INSTANCE_ID,
        } as HeadlessCommandContextApi,
      ],
    ]),
  );
  store.set(
    contextStorePageCommandsComponentState.atomFamily({
      instanceId: CONTEXT_STORE_INSTANCE_ID,
    }),
    {
      [EngineComponentKey.SAVE_PAGE]: {
        ...pageCommand,
        registrationId: 'settings-page',
      },
    },
  );

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <JotaiProvider store={store}>
      <ToastProvider>{children}</ToastProvider>
    </JotaiProvider>
  );

  render(<CommandRunner />, { wrapper: Wrapper });

  const isCommandRunning = () =>
    store.get(headlessCommandContextApisState.atom).has(COMMAND_MENU_ITEM_ID);

  return { isCommandRunning };
};

describe('RunPageCommand', () => {
  it('runs the handler the page registered, then frees the command', async () => {
    const run = jest.fn().mockResolvedValue(undefined);

    const { isCommandRunning } = renderMountedPageCommand({
      run,
      isDisabled: false,
      isLoading: false,
    });

    await waitFor(() => expect(isCommandRunning()).toBe(false));
    expect(run).toHaveBeenCalledTimes(1);
  });

  it('does not run a command the page has disabled', async () => {
    const run = jest.fn();

    const { isCommandRunning } = renderMountedPageCommand({
      run,
      isDisabled: true,
      isLoading: false,
    });

    await waitFor(() => expect(isCommandRunning()).toBe(false));
    expect(run).not.toHaveBeenCalled();
  });
});

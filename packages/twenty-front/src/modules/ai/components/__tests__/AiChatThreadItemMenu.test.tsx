import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider } from 'jotai';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { IconButton } from 'twenty-ui/components';
import { IconDotsVertical } from 'twenty-ui/icon';

import { AiChatThreadItemMenu } from '@/ai/components/AiChatThreadItemMenu';
import { AI_CHAT_THREAD_ACTIONS_SURFACE } from '@/ai/constants/AiChatThreadActionsSurface';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';

const archiveChatThread = jest.fn();
const unarchiveChatThread = jest.fn();

jest.mock('@/ai/hooks/useChatThreadArchiveActions', () => ({
  useChatThreadArchiveActions: () => ({
    archiveChatThread,
    unarchiveChatThread,
  }),
}));

jest.mock('@/ui/layout/dialog/hooks/useDialog', () => ({
  useDialog: () => ({ openDialog: jest.fn() }),
}));

jest.mock('@/navigation/hooks/useIsNavigationDrawerContentExpanded', () => ({
  useIsNavigationDrawerContentExpanded: () => true,
}));

jest.mock('@/ui/utilities/responsive/hooks/useIsMobile', () => ({
  useIsMobile: () => false,
}));

const CurrentLocation = () => {
  const location = useLocation();

  return <output aria-label="Current location">{location.pathname}</output>;
};

it.each([
  { label: 'unlinked', to: undefined },
  { label: 'linked', to: '/chat' },
])(
  'keeps $label drawer menu actions local and closes during an archive request',
  async ({ to }) => {
    const user = userEvent.setup();
    const onRowClick = jest.fn();
    archiveChatThread.mockReturnValue(new Promise(() => {}));
    const store = createStore();
    store.set(metadataStoreState.atomFamily('agentChatThreads'), {
      current: [
        {
          id: 'thread-archive',
          permissions: {
            canRead: true,
            canUpdate: false,
            canDelete: false,
            canSoftDelete: true,
          },
        },
      ],
      draft: [],
      status: 'up-to-date',
    });

    render(
      <I18nProvider i18n={i18n}>
        <Provider store={store}>
          <MemoryRouter initialEntries={['/initial']}>
            <CurrentLocation />
            <NavigationDrawerItem
              label="Leads"
              to={to}
              onClick={onRowClick}
              rightOptions={
                <AiChatThreadItemMenu
                  threadId="thread-archive"
                  threadTitle="Leads"
                  isArchived={false}
                  surface={AI_CHAT_THREAD_ACTIONS_SURFACE.NAV_DRAWER}
                  onRenameRequested={jest.fn()}
                  trigger={
                    <IconButton aria-label="Chat actions" variant="outline">
                      <IconDotsVertical />
                    </IconButton>
                  }
                />
              }
            />
          </MemoryRouter>
        </Provider>
      </I18nProvider>,
    );

    const trigger = screen.getByRole('button', { name: 'Chat actions' });
    await user.click(trigger);
    expect(screen.queryByRole('menuitem', { name: 'Rename' })).toBeNull();
    expect(screen.queryByRole('menuitem', { name: 'Delete' })).toBeNull();
    await user.click(await screen.findByRole('menuitem', { name: 'Archive' }));

    expect(archiveChatThread).toHaveBeenCalledWith('thread-archive');
    expect(onRowClick).not.toHaveBeenCalled();
    expect(
      screen.getByRole('status', { name: 'Current location' }),
    ).toHaveTextContent('/initial');
    await waitFor(() =>
      expect(screen.queryByRole('menu')).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(trigger).toHaveFocus());
  },
);

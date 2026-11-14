import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { SidePanelPages } from 'twenty-shared/types';
import { IconDotsVertical, IconMessage } from 'twenty-ui/icon';

import { SidePanelStartAppConversationPage } from '@/side-panel/pages/start-app-conversation/components/SidePanelStartAppConversationPage';
import { startAppConversationTargetComponentState } from '@/side-panel/pages/start-app-conversation/states/startAppConversationTargetComponentState';
import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { messages } from '~/locales/generated/en';

i18n.load({ [SOURCE_LOCALE]: messages });
i18n.activate(SOURCE_LOCALE);

const startAppChannelConversation = jest.fn();
const openRecordInSidePanel = jest.fn();
const goBackFromSidePanel = jest.fn();
const enqueueToast = jest.fn();

jest.mock('@/activities/emails/hooks/useStartAppChannelConversation', () => ({
  useStartAppChannelConversation: () => ({
    startAppChannelConversation,
    loading: false,
  }),
}));

jest.mock('@/side-panel/hooks/useOpenRecordInSidePanel', () => ({
  useOpenRecordInSidePanel: () => ({ openRecordInSidePanel }),
}));

jest.mock('@/side-panel/hooks/useSidePanelHistory', () => ({
  useSidePanelHistory: () => ({ goBackFromSidePanel }),
}));

jest.mock('@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement', () => ({
  useHotkeysOnFocusedElement: jest.fn(),
}));

jest.mock('twenty-ui/components/feedback', () => ({
  ...jest.requireActual('twenty-ui/components/feedback'),
  useToast: () => ({ enqueueToast }),
}));

const PAGE_ID = 'start-app-conversation-page';
const PERSON_ID = '20202020-0000-4000-8000-000000000001';

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>
    <I18nProvider i18n={i18n}>
      <SidePanelPageComponentInstanceContext.Provider
        value={{ instanceId: PAGE_ID }}
      >
        {children}
      </SidePanelPageComponentInstanceContext.Provider>
    </I18nProvider>
  </JotaiProvider>
);

describe('SidePanelStartAppConversationPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetJotaiStore();
    jotaiStore.set(isSidePanelOpenedState.atom, true);
    jotaiStore.set(sidePanelNavigationStackState.atom, [
      {
        page: SidePanelPages.StartAppConversation,
        pageTitle: 'New conversation',
        pageIcon: IconMessage,
        pageId: PAGE_ID,
      },
    ]);
    jotaiStore.set(
      startAppConversationTargetComponentState.atomFamily({
        instanceId: PAGE_ID,
      }),
      {
        messageChannelId: 'channel-linkedin',
        channelLabel: 'Tim on LinkedIn',
        personId: PERSON_ID,
      },
    );
  });

  it('sends the first message and opens the new thread', async () => {
    const user = userEvent.setup();

    startAppChannelConversation.mockResolvedValue('thread-1');

    render(<SidePanelStartAppConversationPage />, { wrapper: Wrapper });

    expect(screen.getByText('Send from Tim on LinkedIn')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Send/ })).toBeDisabled();

    await user.type(
      screen.getByRole('textbox', { name: 'Message' }),
      '  Hi Grace  ',
    );
    await user.click(screen.getByRole('button', { name: /Send/ }));

    expect(startAppChannelConversation).toHaveBeenCalledWith({
      messageChannelId: 'channel-linkedin',
      personId: PERSON_ID,
      text: 'Hi Grace',
      idempotencyKey: expect.any(String),
    });
    expect(openRecordInSidePanel).toHaveBeenCalledWith({
      recordId: 'thread-1',
      objectNameSingular: 'messageThread',
      resetNavigationStack: true,
    });
  });

  it('keeps the message and its idempotency key when sending fails', async () => {
    const user = userEvent.setup();

    startAppChannelConversation.mockRejectedValueOnce(new Error('failed'));
    startAppChannelConversation.mockResolvedValueOnce('thread-1');

    render(<SidePanelStartAppConversationPage />, { wrapper: Wrapper });

    await user.type(screen.getByRole('textbox', { name: 'Message' }), 'Hi');
    await user.click(screen.getByRole('button', { name: /Send/ }));

    expect(enqueueToast).toHaveBeenCalledWith({
      status: 'error',
      children: 'Could not start the conversation',
    });
    expect(openRecordInSidePanel).not.toHaveBeenCalled();
    expect(screen.getByRole('textbox', { name: 'Message' })).toHaveValue('Hi');

    await user.click(screen.getByRole('button', { name: /Send/ }));

    const [firstCall, secondCall] = startAppChannelConversation.mock.calls;

    expect(secondCall[0].idempotencyKey).toBe(firstCall[0].idempotencyKey);
  });

  it('leaves the side panel alone when the user moved on before the send finished', async () => {
    const user = userEvent.setup();

    startAppChannelConversation.mockImplementation(async () => {
      jotaiStore.set(sidePanelNavigationStackState.atom, [
        {
          page: SidePanelPages.CommandMenuDisplay,
          pageTitle: 'Command Menu',
          pageIcon: IconDotsVertical,
          pageId: 'command-menu',
        },
      ]);

      return 'thread-1';
    });

    render(<SidePanelStartAppConversationPage />, { wrapper: Wrapper });

    await user.type(screen.getByRole('textbox', { name: 'Message' }), 'Hi');
    await user.click(screen.getByRole('button', { name: /Send/ }));

    expect(startAppChannelConversation).toHaveBeenCalled();
    expect(openRecordInSidePanel).not.toHaveBeenCalled();
    expect(goBackFromSidePanel).not.toHaveBeenCalled();
  });
});

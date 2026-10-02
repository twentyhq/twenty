import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider as JotaiProvider } from 'jotai';
import { MemoryRouter } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { NavigationDrawerAiChatTriageSection } from '@/ai/components/NavigationDrawerAiChatTriageSection';
import { AGENT_CHAT_THREAD_FILTER_STATUS } from '@/ai/constants/AgentChatThreadFilterStatus';
import { agentChatThreadFilterStatusState } from '@/ai/states/agentChatThreadFilterStatusState';
import { setAgentChatThreadList } from '@/ai/testing/setAgentChatThreadList';
import { agentChatThreadParticipantsState } from '@/ai/states/agentChatThreadParticipantsState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { messages } from '~/locales/generated/en';

i18n.load({ [SOURCE_LOCALE]: messages });
i18n.activate(SOURCE_LOCALE);

const navigate = jest.fn();

jest.mock('~/hooks/useNavigateApp', () => ({
  useNavigateApp: () => navigate,
}));

const THREAD_IDS = ['thread-1', 'thread-2'];

const renderTriage = (path = '/') =>
  render(
    <JotaiProvider store={jotaiStore}>
      <I18nProvider i18n={i18n}>
        <MemoryRouter initialEntries={[path]}>
          <NavigationDrawerAiChatTriageSection />
        </MemoryRouter>
      </I18nProvider>
    </JotaiProvider>,
  );

describe('NavigationDrawerAiChatTriageSection', () => {
  beforeEach(() => {
    localStorage.clear();
    resetJotaiStore();
    navigate.mockClear();

    setAgentChatThreadList(
      jotaiStore,
      THREAD_IDS.map(
        (threadId) =>
          ({
            __typename: 'AgentChatThread',
            id: threadId,
            deletedAt: null,
            lastActivityAt: '2026-10-01T10:00:00.000Z',
          }) as never,
      ),
    );
    jotaiStore.set(agentChatThreadParticipantsState.atom, {});
  });

  const markThreadAsRead = (threadId: string) =>
    jotaiStore.set(agentChatThreadParticipantsState.atom, (participants) => ({
      ...participants,
      [threadId]: {
        threadId,
        lastReadAt: '2026-10-01T10:00:00.000Z',
        archivedAt: null,
        snoozedUntil: null,
      },
    }));

  it('counts every open chat and flags Open when one is unread', () => {
    markThreadAsRead('thread-1');

    renderTriage();

    expect(
      screen.getByRole('button', { name: /^Open\s*, unread · 2$/ }),
    ).toBeVisible();
    expect(screen.getByRole('button', { name: 'Snoozed' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Done' })).toBeVisible();
  });

  it('shows Open as read when every open chat is read', () => {
    THREAD_IDS.forEach(markThreadAsRead);

    renderTriage();

    expect(screen.getByRole('button', { name: 'Open · 2' })).toBeVisible();
  });

  it('opens the inbox on the chosen status', async () => {
    renderTriage();

    await userEvent.click(screen.getByRole('button', { name: 'Snoozed' }));

    expect(jotaiStore.get(agentChatThreadFilterStatusState.atom)).toBe(
      AGENT_CHAT_THREAD_FILTER_STATUS.SNOOZED,
    );
    expect(navigate).toHaveBeenCalledWith(AppPath.AiChatInbox, {
      threadId: null,
    });
  });
});

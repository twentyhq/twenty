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
import { agentChatThreadListState } from '@/ai/states/agentChatThreadListState';
import { hasLoadedAgentChatThreadParticipantsState } from '@/ai/states/hasLoadedAgentChatThreadParticipantsState';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
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

jest.mock(
  '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem',
  () => ({
    NavigationDrawerItem: ({
      label,
      secondaryLabel,
      active,
      onClick,
    }: {
      label: string;
      secondaryLabel?: string;
      active?: boolean;
      onClick?: () => void;
    }) => (
      <button
        type="button"
        aria-current={active ? 'page' : undefined}
        onClick={onClick}
      >
        {secondaryLabel ? `${label} · ${secondaryLabel}` : label}
      </button>
    ),
  }),
);

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
    resetJotaiStore();
    navigate.mockClear();

    for (const threadId of THREAD_IDS) {
      jotaiStore.set(recordStoreFamilyState.atomFamily(threadId), {
        __typename: 'AgentChatThread',
        id: threadId,
        deletedAt: null,
        lastActivityAt: '2026-10-01T10:00:00.000Z',
      } as never);
    }
    jotaiStore.set(agentChatThreadListState.atom, {
      threadIds: THREAD_IDS,
      hasNextPage: false,
      endCursor: null,
    });
    jotaiStore.set(hasLoadedAgentChatThreadParticipantsState.atom, true);
  });

  it('counts the unread chats in Open', () => {
    renderTriage();

    expect(screen.getByRole('button', { name: 'Open · 2' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Snoozed' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Done' })).toBeVisible();
  });

  it('opens the inbox on the chosen status', async () => {
    renderTriage();

    await userEvent.click(screen.getByRole('button', { name: 'Snoozed' }));

    expect(jotaiStore.get(agentChatThreadFilterStatusState.atom)).toBe(
      AGENT_CHAT_THREAD_FILTER_STATUS.SNOOZED,
    );
    expect(navigate).toHaveBeenCalledWith(AppPath.AiChatInbox);
  });

  it('marks the status shown on the inbox page as current', () => {
    jotaiStore.set(
      agentChatThreadFilterStatusState.atom,
      AGENT_CHAT_THREAD_FILTER_STATUS.ARCHIVED,
    );

    renderTriage(AppPath.AiChatInbox);

    expect(screen.getByRole('button', { name: 'Done' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });
});

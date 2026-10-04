import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { AiChatThreadListItem } from '@/ai/components/AiChatThreadListItem';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { messages } from '~/locales/generated/en';

i18n.load({ [SOURCE_LOCALE]: messages });
i18n.activate(SOURCE_LOCALE);

jest.mock('@/ai/components/AiChatThreadActionsDropdown', () => ({
  AiChatThreadActionsDropdown: () => null,
}));

jest.mock('@/ai/hooks/useAiChatThreadRename', () => ({
  useAiChatThreadRename: () => ({
    isRenaming: false,
    draftTitle: '',
    setDraftTitle: jest.fn(),
    startRename: jest.fn(),
    cancelRename: jest.fn(),
    commitRename: jest.fn(),
  }),
}));

const buildThread = (
  thread: Partial<AgentChatThreadRecord>,
): AgentChatThreadRecord => ({
  __typename: 'AgentChatThread',
  id: '6f1c2b0e-7a4d-4e8b-9c3f-2d5a1b8e7c60',
  title: 'Q3 renewal outreach',
  deletedAt: null,
  createdAt: '2026-09-07T00:00:00.000Z',
  updatedAt: '2026-09-07T00:00:00.000Z',
  lastMessageText: 'Which plan should I quote?',
  ...thread,
});

const renderListItem = (thread: AgentChatThreadRecord) =>
  render(
    <JotaiProvider store={jotaiStore}>
      <I18nProvider i18n={i18n}>
        <AiChatThreadListItem
          thread={thread}
          isSelected={false}
          onClick={jest.fn()}
        />
      </I18nProvider>
    </JotaiProvider>,
  );

describe('AiChatThreadListItem', () => {
  beforeEach(() => {
    resetJotaiStore();
  });

  it('shows the last message under the title', () => {
    renderListItem(buildThread({}));

    expect(screen.getByText('Which plan should I quote?')).toBeInTheDocument();
    expect(screen.queryByText('Needs input')).not.toBeInTheDocument();
  });

  it('shows that the chat needs input while a question waits on an answer', () => {
    renderListItem(
      buildThread({
        pendingQuestionMessageId: '0b6e3f1a-2c4d-4b8e-9a7f-1d3c5e7a9b20',
      }),
    );

    expect(screen.getByText('Needs input')).toBeInTheDocument();
    expect(screen.getByText('Which plan should I quote?')).toBeInTheDocument();
  });

  it('does not ask for input on a deleted chat', () => {
    renderListItem(
      buildThread({
        deletedAt: '2026-09-08T00:00:00.000Z',
        pendingQuestionMessageId: '0b6e3f1a-2c4d-4b8e-9a7f-1d3c5e7a9b20',
      }),
    );

    expect(screen.queryByText('Needs input')).not.toBeInTheDocument();
  });
});

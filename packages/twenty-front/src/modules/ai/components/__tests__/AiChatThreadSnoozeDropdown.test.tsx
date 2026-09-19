import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider as JotaiProvider } from 'jotai';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { AiChatThreadSnoozeDropdown } from '@/ai/components/AiChatThreadSnoozeDropdown';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { messages } from '~/locales/generated/en';

i18n.load({ [SOURCE_LOCALE]: messages });
i18n.activate(SOURCE_LOCALE);

const THREAD_ID = 'thread-1';
const snoozeChatThread = jest.fn();
const reopenChatThread = jest.fn();

let thread: Record<string, unknown> | undefined;

jest.mock('@/ai/hooks/useChatThreadInboxActions', () => ({
  useChatThreadInboxActions: () => ({ snoozeChatThread, reopenChatThread }),
}));
jest.mock('@/ai/hooks/useAiChatThreadById', () => ({
  useAiChatThreadById: () => thread,
}));

const renderDropdown = () =>
  render(
    <JotaiProvider store={jotaiStore}>
      <I18nProvider i18n={i18n}>
        <AiChatThreadSnoozeDropdown threadId={THREAD_ID} />
      </I18nProvider>
    </JotaiProvider>,
  );

describe('AiChatThreadSnoozeDropdown', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetJotaiStore();
    thread = { id: THREAD_ID, status: 'OPEN', snoozedUntil: null };
  });

  it('puts an open chat away until a chosen time', async () => {
    const user = userEvent.setup();

    renderDropdown();

    await user.click(screen.getByRole('button', { name: 'Snooze chat' }));

    expect(screen.queryByText('Unsnooze')).toBeNull();

    await user.click(screen.getByText('Tomorrow morning'));

    expect(snoozeChatThread).toHaveBeenCalledWith(THREAD_ID, expect.any(Date));
  });

  it('offers the way back first on a chat that is already snoozed', async () => {
    const user = userEvent.setup();

    thread = {
      id: THREAD_ID,
      status: 'SNOOZED',
      snoozedUntil: new Date(Date.now() + 3_600_000).toISOString(),
    };

    renderDropdown();

    await user.click(screen.getByRole('button', { name: 'Snoozed' }));
    await user.click(screen.getByText('Unsnooze'));

    expect(reopenChatThread).toHaveBeenCalledWith(THREAD_ID);
    expect(snoozeChatThread).not.toHaveBeenCalled();
  });

  it('treats a snooze that has come due as open again', async () => {
    const user = userEvent.setup();

    thread = {
      id: THREAD_ID,
      status: 'SNOOZED',
      snoozedUntil: new Date(Date.now() - 3_600_000).toISOString(),
    };

    renderDropdown();

    await user.click(screen.getByRole('button', { name: 'Snooze chat' }));

    expect(screen.queryByText('Unsnooze')).toBeNull();
  });
});

import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { fireEvent, render, screen } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { Temporal } from 'temporal-polyfill';

import { SnoozeAiChatUntilDatePicker } from '@/side-panel/pages/snooze-ai-chat/components/SnoozeAiChatUntilDatePicker';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const updateAgentChatThreadInboxState = jest.fn();
const onSnoozed = jest.fn();

jest.mock('@/ai/hooks/useUpdateAgentChatThreadInboxState', () => ({
  useUpdateAgentChatThreadInboxState: () => ({
    updateAgentChatThreadInboxState,
  }),
}));

jest.mock('@/ui/input/components/internal/date/hooks/useUserTimezone', () => ({
  useUserTimezone: () => ({
    userTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  }),
}));

jest.mock(
  '@/ui/input/components/internal/date/components/DateTimePicker',
  () => ({
    DateTimePicker: ({
      onChange,
    }: {
      onChange: (date: Temporal.ZonedDateTime) => void;
    }) => (
      <button
        type="button"
        onClick={() =>
          onChange(
            Temporal.PlainDateTime.from('2026-10-01T17:00').toZonedDateTime(
              Intl.DateTimeFormat().resolvedOptions().timeZone,
            ),
          )
        }
      >
        Pick an earlier time
      </button>
    ),
  }),
);

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>
    <I18nProvider i18n={i18n}>{children}</I18nProvider>
  </JotaiProvider>
);

describe('SnoozeAiChatUntilDatePicker', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 9, 1, 17, 59));
    jest.clearAllMocks();
    resetJotaiStore();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('snoozes the chat until tomorrow morning by default', () => {
    render(
      <SnoozeAiChatUntilDatePicker
        threadIds={['thread-1']}
        onSnoozed={onSnoozed}
      />,
      { wrapper: Wrapper },
    );

    fireEvent.click(screen.getByRole('button', { name: /Snooze until/ }));

    expect(onSnoozed).toHaveBeenCalled();
    expect(updateAgentChatThreadInboxState).toHaveBeenCalledWith({
      threadIds: ['thread-1'],
      action: 'SNOOZE',
      snoozedUntil: new Date(2026, 9, 2, 9, 0),
    });
  });

  it('does not snooze until a time that has passed', () => {
    render(
      <SnoozeAiChatUntilDatePicker
        threadIds={['thread-1']}
        onSnoozed={onSnoozed}
      />,
      { wrapper: Wrapper },
    );

    fireEvent.click(screen.getByText('Pick an earlier time'));
    fireEvent.click(
      screen.getByRole('button', { name: 'Pick a time in the future' }),
    );

    expect(
      screen.getByRole('button', { name: 'Pick a time in the future' }),
    ).toBeDisabled();
    expect(updateAgentChatThreadInboxState).not.toHaveBeenCalled();
    expect(onSnoozed).not.toHaveBeenCalled();
  });

  it('does not snooze once the picked time has passed, and says so', () => {
    render(
      <SnoozeAiChatUntilDatePicker
        threadIds={['thread-1']}
        onSnoozed={onSnoozed}
      />,
      { wrapper: Wrapper },
    );

    jest.setSystemTime(new Date(2026, 9, 2, 9, 1));

    fireEvent.click(screen.getByRole('button', { name: /Snooze until/ }));

    expect(updateAgentChatThreadInboxState).not.toHaveBeenCalled();
    expect(onSnoozed).not.toHaveBeenCalled();
    expect(
      screen.getByRole('button', { name: 'Pick a time in the future' }),
    ).toBeDisabled();
  });
});

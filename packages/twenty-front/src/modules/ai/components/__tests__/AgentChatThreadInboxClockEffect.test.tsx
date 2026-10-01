import { act, render } from '@testing-library/react';
import { createStore, Provider } from 'jotai';

import { AgentChatThreadInboxClockEffect } from '@/ai/components/AgentChatThreadInboxClockEffect';
import { agentChatThreadInboxNowState } from '@/ai/states/agentChatThreadInboxNowState';
import { agentChatThreadParticipantsState } from '@/ai/states/agentChatThreadParticipantsState';

const NOW = new Date('2026-10-01T10:00:00.000Z').getTime();

const renderClock = (snoozedUntil: string | null) => {
  const store = createStore();

  store.set(agentChatThreadInboxNowState.atom, NOW);
  store.set(agentChatThreadParticipantsState.atom, {
    'thread-1': { lastReadAt: null, archivedAt: null, snoozedUntil },
  });

  render(
    <Provider store={store}>
      <AgentChatThreadInboxClockEffect />
    </Provider>,
  );

  return store;
};

describe('AgentChatThreadInboxClockEffect', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(NOW);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('moves the clock when a snooze ends', () => {
    const store = renderClock('2026-10-01T11:00:00.000Z');

    act(() => {
      jest.advanceTimersByTime(60 * 60 * 1000 - 1);
    });

    expect(store.get(agentChatThreadInboxNowState.atom)).toBe(NOW);

    act(() => {
      jest.advanceTimersByTime(1);
    });

    expect(store.get(agentChatThreadInboxNowState.atom)).toBe(
      NOW + 60 * 60 * 1000,
    );
  });

  it('keeps the clock still without a pending snooze', () => {
    const store = renderClock(null);

    act(() => {
      jest.advanceTimersByTime(24 * 60 * 60 * 1000);
    });

    expect(store.get(agentChatThreadInboxNowState.atom)).toBe(NOW);
  });
});

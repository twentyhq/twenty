import { act, render } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';

import { AgentChatThreadParticipantOperationsEffect } from '@/ai/components/AgentChatThreadParticipantOperationsEffect';
import { agentChatThreadParticipantsState } from '@/ai/states/agentChatThreadParticipantsState';
import { agentChatThreadStreamedParticipantsState } from '@/ai/states/agentChatThreadStreamedParticipantsState';
import { dispatchMetadataOperationBrowserEvent } from '@/browser-event/utils/dispatchMetadataOperationBrowserEvent';
import { type AgentChatThreadParticipantFieldsFragment } from '~/generated-metadata/graphql';

const THREAD_ID = '20202020-0000-4000-8000-0000000000aa';

const READ_PARTICIPANT: AgentChatThreadParticipantFieldsFragment = {
  threadId: THREAD_ID,
  lastReadAt: '2026-10-01T10:00:00.000Z',
  archivedAt: null,
  snoozedUntil: null,
  hasSnoozeEnded: false,
  updatedAt: '2026-10-01T10:00:00.000Z',
};

const renderEffect = (
  participants: Record<string, AgentChatThreadParticipantFieldsFragment> | null,
) => {
  const store = createStore();

  store.set(agentChatThreadParticipantsState.atom, participants);

  render(
    <JotaiProvider store={store}>
      <AgentChatThreadParticipantOperationsEffect />
    </JotaiProvider>,
  );

  return { store };
};

const receiveParticipant = (
  participant: AgentChatThreadParticipantFieldsFragment,
) =>
  act(() =>
    dispatchMetadataOperationBrowserEvent({
      metadataName: 'agentChatThreadParticipant',
      operation: { type: 'update', updatedRecord: participant },
    }),
  );

describe('AgentChatThreadParticipantOperationsEffect', () => {
  it('applies a change the member made elsewhere', () => {
    const { store } = renderEffect({ [THREAD_ID]: READ_PARTICIPANT });
    const unreadParticipant = {
      ...READ_PARTICIPANT,
      lastReadAt: null,
      updatedAt: '2026-10-01T10:05:00.000Z',
    };

    receiveParticipant(unreadParticipant);

    expect(store.get(agentChatThreadParticipantsState.atom)).toEqual({
      [THREAD_ID]: unreadParticipant,
    });
  });

  it('applies the end of a snooze', () => {
    const { store } = renderEffect({});
    const snoozeEndedParticipant = {
      ...READ_PARTICIPANT,
      archivedAt: '2026-10-01T11:00:00.000Z',
      snoozedUntil: '2026-10-02T09:00:00.000Z',
      hasSnoozeEnded: true,
    };

    receiveParticipant(snoozeEndedParticipant);

    expect(
      store.get(agentChatThreadParticipantsState.atom)?.[THREAD_ID],
    ).toEqual(snoozeEndedParticipant);
  });

  it('ignores a copy older than the one it has', () => {
    const { store } = renderEffect({ [THREAD_ID]: READ_PARTICIPANT });

    receiveParticipant({
      ...READ_PARTICIPANT,
      lastReadAt: null,
      updatedAt: '2026-10-01T09:59:00.000Z',
    });

    expect(store.get(agentChatThreadParticipantsState.atom)).toEqual({
      [THREAD_ID]: READ_PARTICIPANT,
    });
  });

  it('keeps a change that arrives before the first load for that load', () => {
    const { store } = renderEffect(null);

    receiveParticipant(READ_PARTICIPANT);

    expect(store.get(agentChatThreadParticipantsState.atom)).toBeNull();
    expect(store.get(agentChatThreadStreamedParticipantsState.atom)).toEqual({
      [THREAD_ID]: READ_PARTICIPANT,
    });
  });
});

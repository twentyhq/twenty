import { MockedProvider } from '@apollo/client/testing/react';
import { act, render } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { CoreObjectNameSingular } from 'twenty-shared/types';

import { AgentChatThreadParticipantOperationsEffect } from '@/ai/components/AgentChatThreadParticipantOperationsEffect';
import { agentChatThreadParticipantsState } from '@/ai/states/agentChatThreadParticipantsState';
import { agentChatThreadStreamedParticipantsState } from '@/ai/states/agentChatThreadStreamedParticipantsState';
import { mergeAgentChatThreadParticipants } from '@/ai/utils/mergeAgentChatThreadParticipants';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { dispatchObjectRecordOperationBrowserEvent } from '@/browser-event/utils/dispatchObjectRecordOperationBrowserEvent';
import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { type AgentChatThreadParticipantFieldsFragment } from '~/generated-metadata/graphql';

const PARTICIPANT_OBJECT_METADATA_ITEM = {
  id: 'participant-object-metadata-id',
  nameSingular: CoreObjectNameSingular.AgentChatThreadParticipant,
};

jest.mock('@/sse-db-event/hooks/useListenToEventsForQuery', () => ({
  useListenToEventsForQuery: jest.fn(),
}));

jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue',
  () => ({
    useAtomFamilySelectorValue: (selector: unknown) =>
      selector === objectMetadataItemFamilySelector
        ? PARTICIPANT_OBJECT_METADATA_ITEM
        : undefined,
  }),
);

const THREAD_ID = '20202020-0000-4000-8000-0000000000aa';
const PARTICIPANT_ID = '20202020-0000-4000-8000-0000000000bb';

const READ_PARTICIPANT: AgentChatThreadParticipantFieldsFragment = {
  id: PARTICIPANT_ID,
  threadId: THREAD_ID,
  lastReadAt: '2026-10-01T10:00:00.000Z',
  archivedAt: null,
  snoozedUntil: null,
  isSubscribed: true,
  lastMentionedAt: null,
  updatedAt: '2026-10-01T10:00:00.000Z',
};

const renderEffect = (
  participants: Record<string, AgentChatThreadParticipantFieldsFragment> | null,
) => {
  const store = createStore();

  store.set(agentChatThreadParticipantsState.atom, participants);
  store.set(currentWorkspaceMemberState.atom, {
    id: 'workspace-member-id',
  } as never);

  render(
    <JotaiProvider store={store}>
      <MockedProvider>
        <AgentChatThreadParticipantOperationsEffect />
      </MockedProvider>
    </JotaiProvider>,
  );

  return { store };
};

const receiveCreatedParticipant = (
  participant: AgentChatThreadParticipantFieldsFragment,
) =>
  act(() =>
    dispatchObjectRecordOperationBrowserEvent({
      objectMetadataItem: PARTICIPANT_OBJECT_METADATA_ITEM as never,
      operation: {
        type: 'create-one',
        createdRecord: {
          ...participant,
          __typename: 'AgentChatThreadParticipant',
          workspaceMemberId: 'workspace-member-id',
        },
      },
    }),
  );

const receiveParticipantUpdate = (
  participant: AgentChatThreadParticipantFieldsFragment,
) =>
  act(() =>
    dispatchObjectRecordOperationBrowserEvent({
      objectMetadataItem: PARTICIPANT_OBJECT_METADATA_ITEM as never,
      operation: {
        type: 'update-one',
        result: {
          updateInput: {
            recordId: participant.id,
            updatedFields: [{ updatedAt: participant.updatedAt }],
            updatedRecord: {
              ...participant,
              workspaceMemberId: 'workspace-member-id',
            },
          },
        },
      },
    }),
  );

describe('AgentChatThreadParticipantOperationsEffect', () => {
  it('adds a row the member created elsewhere', () => {
    const { store } = renderEffect({});

    receiveCreatedParticipant(READ_PARTICIPANT);

    expect(store.get(agentChatThreadParticipantsState.atom)).toEqual({
      [THREAD_ID]: READ_PARTICIPANT,
    });
  });

  it('applies a change the member made elsewhere', () => {
    const { store } = renderEffect({ [THREAD_ID]: READ_PARTICIPANT });

    const change = {
      lastReadAt: null,
      updatedAt: '2026-10-01T10:05:00.000Z',
    };

    receiveParticipantUpdate({ ...READ_PARTICIPANT, ...change });

    expect(store.get(agentChatThreadParticipantsState.atom)).toEqual({
      [THREAD_ID]: { ...READ_PARTICIPANT, ...change },
    });
  });

  it('applies the end of a snooze', () => {
    const snoozedParticipant = {
      ...READ_PARTICIPANT,
      archivedAt: '2026-10-01T11:00:00.000Z',
      snoozedUntil: '2026-10-02T09:00:00.000Z',
      isSubscribed: true,
      lastMentionedAt: null,
    };
    const { store } = renderEffect({ [THREAD_ID]: snoozedParticipant });

    const change = {
      archivedAt: null,
      updatedAt: '2026-10-02T09:00:00.000Z',
    };

    receiveParticipantUpdate({ ...snoozedParticipant, ...change });

    expect(
      store.get(agentChatThreadParticipantsState.atom)?.[THREAD_ID],
    ).toEqual({ ...snoozedParticipant, ...change });
  });

  it('keeps a change for a page already on its way, with its new version', () => {
    // Archived through an earlier change, so its version is still T0
    const { store } = renderEffect({
      [THREAD_ID]: {
        ...READ_PARTICIPANT,
        archivedAt: '2026-10-01T10:01:00.000Z',
      },
    });
    const loadedArchivedParticipant = {
      ...READ_PARTICIPANT,
      archivedAt: '2026-10-01T10:01:00.000Z',
      updatedAt: '2026-10-01T10:01:00.000Z',
    };

    receiveParticipantUpdate({
      ...READ_PARTICIPANT,
      archivedAt: null,
      updatedAt: '2026-10-01T10:02:00.000Z',
    });

    // A page that read the archived row (T1) merges this change (T2) over it
    expect(
      mergeAgentChatThreadParticipants(
        { [THREAD_ID]: loadedArchivedParticipant },
        Object.values(store.get(agentChatThreadStreamedParticipantsState.atom)),
      )[THREAD_ID],
    ).toEqual({
      ...READ_PARTICIPANT,
      archivedAt: null,
      updatedAt: '2026-10-01T10:02:00.000Z',
    });
  });

  it('ignores a change older than the version it has', () => {
    const { store } = renderEffect({ [THREAD_ID]: READ_PARTICIPANT });

    receiveParticipantUpdate({
      ...READ_PARTICIPANT,
      archivedAt: '2026-10-01T09:58:00.000Z',
      updatedAt: '2026-10-01T09:59:00.000Z',
    });

    expect(store.get(agentChatThreadParticipantsState.atom)).toEqual({
      [THREAD_ID]: READ_PARTICIPANT,
    });
  });

  it('applies a change to a row it has not loaded', () => {
    const { store } = renderEffect({});

    receiveParticipantUpdate(READ_PARTICIPANT);

    expect(store.get(agentChatThreadParticipantsState.atom)).toEqual({
      [THREAD_ID]: READ_PARTICIPANT,
    });
  });

  it('applies a change to a row that arrived before the first page', () => {
    const { store } = renderEffect(null);

    receiveCreatedParticipant(READ_PARTICIPANT);
    receiveParticipantUpdate({
      ...READ_PARTICIPANT,
      lastReadAt: null,
      updatedAt: '2026-10-01T10:05:00.000Z',
    });

    expect(store.get(agentChatThreadStreamedParticipantsState.atom)).toEqual({
      [THREAD_ID]: {
        ...READ_PARTICIPANT,
        lastReadAt: null,
        updatedAt: '2026-10-01T10:05:00.000Z',
      },
    });
  });

  it('ignores a copy older than the one it has', () => {
    const { store } = renderEffect({ [THREAD_ID]: READ_PARTICIPANT });

    receiveCreatedParticipant({
      ...READ_PARTICIPANT,
      lastReadAt: null,
      updatedAt: '2026-10-01T09:59:00.000Z',
    });

    expect(store.get(agentChatThreadParticipantsState.atom)).toEqual({
      [THREAD_ID]: READ_PARTICIPANT,
    });
  });

  it('keeps a row that arrives before the first page for that page', () => {
    const { store } = renderEffect(null);

    receiveCreatedParticipant(READ_PARTICIPANT);

    expect(store.get(agentChatThreadParticipantsState.atom)).toBeNull();
    expect(store.get(agentChatThreadStreamedParticipantsState.atom)).toEqual({
      [THREAD_ID]: READ_PARTICIPANT,
    });
  });
});

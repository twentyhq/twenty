import { type CoreApiClient } from 'twenty-client-sdk/core';
import { describe, expect, it, vi } from 'vitest';

import { buildGranolaNote } from 'src/__tests__/utils/build-granola-note.util';
import { buildGranolaTranscriptItem } from 'src/__tests__/utils/build-granola-transcript-item.util';
import { type GranolaNote } from 'src/logic-functions/types/granola-api.type';
import { type CallRecordingSyncState } from 'src/logic-functions/types/call-recording-sync-state.type';
import { computeCallRecordingIdForGranolaNote } from 'src/logic-functions/utils/compute-call-recording-id-for-granola-note.util';
import { syncGranolaNoteToCallRecordingOrThrow } from 'src/logic-functions/utils/sync-granola-note-to-call-recording-or-throw.util';

const NOTE_ID = 'not_1d3tmYTlCICgjy';
const CALL_RECORDING_ID = computeCallRecordingIdForGranolaNote(NOTE_ID);
const NOTE_UPDATED_AT = '2026-09-05T11:00:00Z';
const EDITED_NOTE_UPDATED_AT = '2026-09-06T09:00:00Z';
const CALENDAR_EVENT_ID = '6f1c1f9e-4b8a-4f43-9d6e-2a7c5b0e8d11';
const GRANOLA_CALENDAR_EVENT: GranolaNote['calendar_event'] = {
  event_title: 'Customer meeting',
  invitees: [],
  organiser: null,
  calendar_event_id: 'google-event-1',
  scheduled_start_time: null,
  scheduled_end_time: null,
};
const SYNC_STATE_QUERY = {
  callRecordings: {
    __args: {
      filter: {
        id: { in: [CALL_RECORDING_ID] },
        or: [{ deletedAt: { is: 'NULL' } }, { deletedAt: { is: 'NOT_NULL' } }],
      },
      first: 1,
    },
    edges: {
      node: { id: true, deletedAt: true, granolaNoteUpdatedAt: true },
    },
  },
};

const buildCompleteNote = (overrides: Partial<GranolaNote> = {}) =>
  buildGranolaNote({
    id: NOTE_ID,
    updated_at: NOTE_UPDATED_AT,
    transcript: [buildGranolaTranscriptItem()],
    ...overrides,
  });

const buildSyncState = (
  overrides: Partial<CallRecordingSyncState> = {},
): CallRecordingSyncState => ({
  id: CALL_RECORDING_ID,
  deletedAt: null,
  granolaNoteUpdatedAt: NOTE_UPDATED_AT,
  ...overrides,
});

const syncNote = async ({
  note,
  syncState,
  shouldSkipUnchangedNote = true,
  matchedCalendarEventIds = [],
}: {
  note: GranolaNote;
  syncState?: CallRecordingSyncState;
  shouldSkipUnchangedNote?: boolean;
  matchedCalendarEventIds?: string[];
}) => {
  const coreApiClient: Pick<CoreApiClient, 'query' | 'mutation'> = {
    query: vi.fn().mockImplementation(async (query: object) =>
      'callRecordings' in query
        ? {
            callRecordings: {
              edges: syncState === undefined ? [] : [{ node: syncState }],
            },
          }
        : {
            calendarChannelEventAssociations: {
              edges: matchedCalendarEventIds.map((calendarEventId) => ({
                node: { calendarEventId },
              })),
              pageInfo: { hasNextPage: false },
            },
          },
    ),
    mutation: vi
      .fn()
      .mockResolvedValue({ updateCallRecordings: [{ id: CALL_RECORDING_ID }] }),
  };
  const client = {
    getNote: vi.fn().mockResolvedValue(note),
    listTranscriptPage: vi.fn(),
  };
  const result = await syncGranolaNoteToCallRecordingOrThrow({
    coreApiClient,
    client,
    noteId: NOTE_ID,
    shouldSkipUnchangedNote,
  });

  return { result, coreApiClient };
};

describe('syncGranolaNoteToCallRecordingOrThrow', () => {
  it('skips a note already imported at its current version with a single lookup', async () => {
    const { result, coreApiClient } = await syncNote({
      note: buildCompleteNote(),
      syncState: buildSyncState(),
    });

    expect(result).toEqual({
      callRecordingId: CALL_RECORDING_ID,
      created: false,
      skipped: true,
      unchanged: true,
    });
    expect(coreApiClient.query).toHaveBeenCalledExactlyOnceWith(
      SYNC_STATE_QUERY,
    );
    expect(coreApiClient.mutation).not.toHaveBeenCalled();
  });

  it('rewrites an edited note with one lookup and one update that records its version', async () => {
    const { result, coreApiClient } = await syncNote({
      note: buildCompleteNote({ updated_at: '2026-09-06T09:00:00Z' }),
      syncState: buildSyncState(),
    });

    expect(result).toEqual({
      callRecordingId: CALL_RECORDING_ID,
      created: false,
      calendarEventId: undefined,
    });
    expect(coreApiClient.query).toHaveBeenCalledExactlyOnceWith(
      SYNC_STATE_QUERY,
    );
    expect(coreApiClient.mutation).toHaveBeenCalledExactlyOnceWith({
      updateCallRecordings: {
        __args: {
          filter: { id: { eq: CALL_RECORDING_ID }, deletedAt: { is: 'NULL' } },
          data: expect.objectContaining({
            status: 'COMPLETED',
            granolaNoteUpdatedAt: '2026-09-06T09:00:00Z',
          }),
        },
        id: true,
      },
    });
  });

  it('creates a new note with one lookup and one create', async () => {
    const { result, coreApiClient } = await syncNote({
      note: buildCompleteNote(),
    });

    expect(result).toEqual({
      callRecordingId: CALL_RECORDING_ID,
      created: true,
      calendarEventId: undefined,
    });
    expect(coreApiClient.query).toHaveBeenCalledExactlyOnceWith(
      SYNC_STATE_QUERY,
    );
    expect(coreApiClient.mutation).toHaveBeenCalledExactlyOnceWith({
      createCallRecording: {
        __args: {
          data: expect.objectContaining({
            id: CALL_RECORDING_ID,
            granolaNoteUpdatedAt: NOTE_UPDATED_AT,
          }),
        },
        id: true,
      },
    });
  });

  it('leaves a deleted recording alone without matching calendar events', async () => {
    const { result, coreApiClient } = await syncNote({
      note: buildCompleteNote({
        updated_at: '2026-09-06T09:00:00Z',
        calendar_event: {
          event_title: 'Customer meeting',
          invitees: [{ email: 'bob@example.com' }],
          organiser: 'alice@example.com',
          calendar_event_id: 'google-event-1',
          scheduled_start_time: '2026-09-05T10:00:00Z',
          scheduled_end_time: '2026-09-05T11:00:00Z',
        },
      }),
      syncState: buildSyncState({ deletedAt: '2026-09-05T12:00:00Z' }),
    });

    expect(result).toEqual({
      callRecordingId: CALL_RECORDING_ID,
      created: false,
      skipped: true,
    });
    expect(coreApiClient.query).toHaveBeenCalledExactlyOnceWith(
      SYNC_STATE_QUERY,
    );
    expect(coreApiClient.mutation).not.toHaveBeenCalled();
  });

  it('rewrites an unchanged note when a manual sync asks for it', async () => {
    const { coreApiClient } = await syncNote({
      note: buildCompleteNote(),
      syncState: buildSyncState(),
      shouldSkipUnchangedNote: false,
    });

    expect(coreApiClient.mutation).toHaveBeenCalledExactlyOnceWith({
      updateCallRecordings: {
        __args: {
          filter: { id: { eq: CALL_RECORDING_ID }, deletedAt: { is: 'NULL' } },
          data: expect.objectContaining({
            granolaNoteUpdatedAt: NOTE_UPDATED_AT,
          }),
        },
        id: true,
      },
    });
  });

  it('records the version of a note whose calendar event is matched', async () => {
    const { coreApiClient } = await syncNote({
      note: buildCompleteNote({
        updated_at: EDITED_NOTE_UPDATED_AT,
        calendar_event: GRANOLA_CALENDAR_EVENT,
      }),
      syncState: buildSyncState(),
      matchedCalendarEventIds: [CALENDAR_EVENT_ID],
    });

    expect(coreApiClient.mutation).toHaveBeenCalledExactlyOnceWith({
      updateCallRecordings: {
        __args: {
          filter: { id: { eq: CALL_RECORDING_ID }, deletedAt: { is: 'NULL' } },
          data: expect.objectContaining({
            calendarEventId: CALENDAR_EVENT_ID,
            granolaNoteUpdatedAt: EDITED_NOTE_UPDATED_AT,
          }),
        },
        id: true,
      },
    });
  });

  it.each([
    ['has no transcript yet', { transcript: null }],
    ['has no summary yet', { summary_text: '', summary_markdown: null }],
    [
      'has an unmatched calendar event',
      { calendar_event: GRANOLA_CALENDAR_EVENT },
    ],
  ])(
    'clears the imported version of an edited note that %s',
    async (_, overrides: Partial<GranolaNote>) => {
      const { coreApiClient } = await syncNote({
        note: buildCompleteNote({
          updated_at: EDITED_NOTE_UPDATED_AT,
          ...overrides,
        }),
        syncState: buildSyncState(),
      });

      expect(coreApiClient.mutation).toHaveBeenCalledExactlyOnceWith({
        updateCallRecordings: {
          __args: {
            filter: {
              id: { eq: CALL_RECORDING_ID },
              deletedAt: { is: 'NULL' },
            },
            data: expect.objectContaining({ granolaNoteUpdatedAt: null }),
          },
          id: true,
        },
      });
    },
  );

  it('keeps the previously imported summary when an edited note loses it', async () => {
    const { coreApiClient } = await syncNote({
      note: buildCompleteNote({
        updated_at: EDITED_NOTE_UPDATED_AT,
        summary_text: '',
        summary_markdown: null,
      }),
      syncState: buildSyncState(),
    });

    expect(coreApiClient.mutation).toHaveBeenCalledExactlyOnceWith({
      updateCallRecordings: {
        __args: {
          filter: { id: { eq: CALL_RECORDING_ID }, deletedAt: { is: 'NULL' } },
          data: expect.not.objectContaining({ summary: expect.anything() }),
        },
        id: true,
      },
    });
  });
});

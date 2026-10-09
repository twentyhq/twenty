import { beforeEach, describe, expect, it, vi } from 'vitest';

import { buildGranolaNote } from 'src/__tests__/utils/build-granola-note.util';
import { buildGranolaTranscriptItem } from 'src/__tests__/utils/build-granola-transcript-item.util';
import { type CallRecordingSyncState } from 'src/logic-functions/types/call-recording-sync-state.type';
import { type GranolaNote } from 'src/logic-functions/types/granola-api.type';
import { computeCallRecordingIdForGranolaNote } from 'src/logic-functions/utils/compute-call-recording-id-for-granola-note.util';
import { syncGranolaNoteToCallRecordingOrThrow } from 'src/logic-functions/utils/sync-granola-note-to-call-recording-or-throw.util';

const mocks = vi.hoisted(() => ({
  findSyncStates: vi.fn(),
  findCalendarEvent: vi.fn(),
  upsert: vi.fn(),
}));

vi.mock(
  'src/logic-functions/utils/find-call-recording-sync-states-or-throw.util',
  () => ({ findCallRecordingSyncStatesOrThrow: mocks.findSyncStates }),
);

vi.mock(
  'src/logic-functions/utils/find-matching-calendar-event-or-throw.util',
  () => ({ findMatchingCalendarEventOrThrow: mocks.findCalendarEvent }),
);

vi.mock(
  'src/logic-functions/utils/upsert-call-recording-or-throw.util',
  () => ({
    upsertCallRecordingOrThrow: mocks.upsert,
  }),
);

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
const IMPORTED_SYNC_STATE: CallRecordingSyncState = {
  id: CALL_RECORDING_ID,
  deletedAt: null,
  granolaNoteUpdatedAt: NOTE_UPDATED_AT,
};

const syncNote = ({
  syncState = IMPORTED_SYNC_STATE,
  shouldSkipUnchangedNote = true,
  ...overrides
}: Partial<GranolaNote> & {
  syncState?: CallRecordingSyncState | null;
  shouldSkipUnchangedNote?: boolean;
}) => {
  mocks.findSyncStates.mockResolvedValue(
    new Map(syncState === null ? [] : [[CALL_RECORDING_ID, syncState]]),
  );

  return syncGranolaNoteToCallRecordingOrThrow({
    coreApiClient: { query: vi.fn(), mutation: vi.fn() },
    client: {
      getNote: vi.fn().mockResolvedValue(
        buildGranolaNote({
          id: NOTE_ID,
          updated_at: NOTE_UPDATED_AT,
          transcript: [buildGranolaTranscriptItem()],
          ...overrides,
        }),
      ),
      listTranscriptPage: vi.fn(),
    },
    noteId: NOTE_ID,
    shouldSkipUnchangedNote,
  });
};

const expectWrittenFields = (fields: Record<string, unknown>) =>
  expect(mocks.upsert).toHaveBeenCalledExactlyOnceWith(
    expect.objectContaining({ fields: expect.objectContaining(fields) }),
  );

describe('syncGranolaNoteToCallRecordingOrThrow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.findCalendarEvent.mockResolvedValue(undefined);
    mocks.upsert.mockResolvedValue({
      callRecordingId: CALL_RECORDING_ID,
      created: false,
    });
  });

  it('skips a note already imported at its current version', async () => {
    await expect(syncNote({})).resolves.toEqual({
      callRecordingId: CALL_RECORDING_ID,
      created: false,
      skipped: true,
      unchanged: true,
    });
    expect(mocks.upsert).not.toHaveBeenCalled();
  });

  it.each([
    ['a new note', { syncState: null }],
    ['an edited note', {}],
    ['an unchanged note on a manual sync', { shouldSkipUnchangedNote: false }],
  ])('records the version of %s', async (_, options) => {
    const updatedAt =
      'shouldSkipUnchangedNote' in options
        ? NOTE_UPDATED_AT
        : EDITED_NOTE_UPDATED_AT;

    await syncNote({ updated_at: updatedAt, ...options });

    expectWrittenFields({
      status: 'COMPLETED',
      granolaNoteUpdatedAt: updatedAt,
    });
  });

  it('records the version of a note whose calendar event is matched', async () => {
    mocks.findCalendarEvent.mockResolvedValue(CALENDAR_EVENT_ID);

    await syncNote({
      updated_at: EDITED_NOTE_UPDATED_AT,
      calendar_event: GRANOLA_CALENDAR_EVENT,
    });

    expectWrittenFields({
      calendarEventId: CALENDAR_EVENT_ID,
      granolaNoteUpdatedAt: EDITED_NOTE_UPDATED_AT,
    });
  });

  it.each([
    ['has no transcript yet', { transcript: null }],
    [
      'has an unmatched calendar event',
      { calendar_event: GRANOLA_CALENDAR_EVENT },
    ],
  ])(
    'clears the imported version of an edited note that %s',
    async (_, overrides: Partial<GranolaNote>) => {
      await syncNote({ updated_at: EDITED_NOTE_UPDATED_AT, ...overrides });

      expectWrittenFields({ granolaNoteUpdatedAt: null });
    },
  );

  it('clears the version but keeps the imported summary of an edited note that lost it', async () => {
    await syncNote({
      updated_at: EDITED_NOTE_UPDATED_AT,
      summary_text: '',
      summary_markdown: null,
    });

    expectWrittenFields({ granolaNoteUpdatedAt: null });
    expect(mocks.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        fields: expect.not.objectContaining({ summary: expect.anything() }),
      }),
    );
  });
});

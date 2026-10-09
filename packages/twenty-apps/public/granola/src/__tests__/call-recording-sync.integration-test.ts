import { randomUUID } from 'node:crypto';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { buildGranolaNote } from 'src/__tests__/utils/build-granola-note.util';
import { buildGranolaTranscriptItem } from 'src/__tests__/utils/build-granola-transcript-item.util';
import { createGranolaApplicationAccessToken } from 'src/__tests__/utils/create-granola-application-access-token.util';
import { type GranolaNote } from 'src/logic-functions/types/granola-api.type';
import { computeCallRecordingIdForGranolaNote } from 'src/logic-functions/utils/compute-call-recording-id-for-granola-note.util';
import { createApplicationCoreApiClient } from 'src/logic-functions/utils/create-application-core-api-client.util';
import { findCallRecordingSyncStatesOrThrow } from 'src/logic-functions/utils/find-call-recording-sync-states-or-throw.util';
import { selectGranolaNotesToSyncOrThrow } from 'src/logic-functions/utils/select-granola-notes-to-sync-or-throw.util';
import { syncGranolaNoteToCallRecordingOrThrow } from 'src/logic-functions/utils/sync-granola-note-to-call-recording-or-throw.util';
import { updateCallRecordingOrThrow } from 'src/logic-functions/utils/update-call-recording-or-throw.util';

const APPLICATION_ACCESS_TOKEN_ENV_VAR_NAME =
  'TWENTY_APP_APPLICATION_ACCESS_TOKEN';
const EDITED_NOTE_UPDATED_AT = '2026-09-06T09:00:00Z';
const coreApiClient = new CoreApiClient();
const trackedCallRecordingIds: string[] = [];
let syncClient: CoreApiClient;

const buildCompleteNote = (overrides: Partial<GranolaNote> = {}) =>
  buildGranolaNote({
    id: `not_${randomUUID().replace(/-/g, '').slice(0, 14)}`,
    transcript: [buildGranolaTranscriptItem()],
    ...overrides,
  });

const syncNote = (note: GranolaNote) => {
  trackedCallRecordingIds.push(computeCallRecordingIdForGranolaNote(note.id));

  return syncGranolaNoteToCallRecordingOrThrow({
    coreApiClient: syncClient,
    client: {
      getNote: vi.fn().mockResolvedValue(note),
      listTranscriptPage: vi.fn(),
    },
    noteId: note.id,
    shouldSkipUnchangedNote: true,
  });
};

const findSyncState = async (callRecordingId: string) =>
  (
    await findCallRecordingSyncStatesOrThrow({
      coreApiClient: syncClient,
      callRecordingIds: [callRecordingId],
    })
  ).get(callRecordingId);

const readTitle = async (callRecordingId: string) => {
  const result = await coreApiClient.query({
    callRecording: {
      __args: { filter: { id: { eq: callRecordingId } } },
      title: true,
    },
  });

  return result.callRecording?.title;
};

const softDelete = (callRecordingId: string) =>
  coreApiClient.mutation({
    deleteCallRecording: { __args: { id: callRecordingId }, id: true },
  });

beforeAll(async () => {
  process.env[APPLICATION_ACCESS_TOKEN_ENV_VAR_NAME] =
    await createGranolaApplicationAccessToken();
  syncClient = createApplicationCoreApiClient();
  delete process.env[APPLICATION_ACCESS_TOKEN_ENV_VAR_NAME];
});

afterEach(async () => {
  vi.restoreAllMocks();

  const existingSyncStates = await findCallRecordingSyncStatesOrThrow({
    coreApiClient,
    callRecordingIds: trackedCallRecordingIds.splice(0),
  });

  for (const callRecordingId of existingSyncStates.keys()) {
    await coreApiClient.mutation({
      destroyCallRecording: { __args: { id: callRecordingId }, id: true },
    });
  }
});

describe('Granola call recording sync', () => {
  it('records the version of a new note and writes nothing when it is synced again unchanged', async () => {
    const note = buildCompleteNote();
    const callRecordingId = computeCallRecordingIdForGranolaNote(note.id);

    expect(await syncNote(note)).toEqual(
      expect.objectContaining({ callRecordingId, created: true }),
    );
    expect(await findSyncState(callRecordingId)).toEqual({
      id: callRecordingId,
      deletedAt: null,
      granolaNoteUpdatedAt: note.updated_at,
    });

    const mutationSpy = vi.spyOn(syncClient, 'mutation');

    expect(await syncNote(note)).toEqual({
      callRecordingId,
      created: false,
      skipped: true,
      unchanged: true,
    });
    expect(mutationSpy).not.toHaveBeenCalled();
  });

  it('rewrites a note edited since its last import', async () => {
    const note = buildCompleteNote();
    const callRecordingId = computeCallRecordingIdForGranolaNote(note.id);

    await syncNote(note);

    expect(
      await syncNote({
        ...note,
        title: 'Renamed meeting',
        updated_at: EDITED_NOTE_UPDATED_AT,
      }),
    ).toEqual(expect.objectContaining({ callRecordingId, created: false }));
    expect(await readTitle(callRecordingId)).toBe('Renamed meeting');
    expect((await findSyncState(callRecordingId))?.granolaNoteUpdatedAt).toBe(
      EDITED_NOTE_UPDATED_AT,
    );
  });

  it('finds live and soft-deleted recordings in one sync state lookup', async () => {
    const liveNote = buildCompleteNote();
    const deletedNote = buildCompleteNote();
    const liveCallRecordingId = computeCallRecordingIdForGranolaNote(
      liveNote.id,
    );
    const deletedCallRecordingId = computeCallRecordingIdForGranolaNote(
      deletedNote.id,
    );

    await syncNote(liveNote);
    await syncNote(deletedNote);
    await softDelete(deletedCallRecordingId);

    const syncStates = await findCallRecordingSyncStatesOrThrow({
      coreApiClient: syncClient,
      callRecordingIds: [liveCallRecordingId, deletedCallRecordingId],
    });

    expect(syncStates.get(liveCallRecordingId)?.deletedAt).toBeNull();
    expect(syncStates.get(deletedCallRecordingId)?.deletedAt).toEqual(
      expect.any(String),
    );
  });

  it('neither updates nor resurrects a soft-deleted recording', async () => {
    const note = buildCompleteNote();
    const editedNote = buildCompleteNote({
      id: note.id,
      title: 'Renamed meeting',
      updated_at: EDITED_NOTE_UPDATED_AT,
      calendar_event: {
        event_title: 'Renamed meeting',
        invitees: [{ email: 'bob@example.com' }],
        organiser: 'alice@example.com',
        calendar_event_id: 'google-event-1',
        scheduled_start_time: '2026-09-05T10:00:00Z',
        scheduled_end_time: '2026-09-05T11:00:00Z',
      },
    });
    const newNote = buildCompleteNote();
    const callRecordingId = computeCallRecordingIdForGranolaNote(note.id);

    await syncNote(note);
    await softDelete(callRecordingId);

    expect(
      await updateCallRecordingOrThrow({
        coreApiClient: syncClient,
        callRecordingId,
        fields: { title: 'Renamed meeting' },
      }),
    ).toBe(false);

    const querySpy = vi.spyOn(syncClient, 'query');
    const mutationSpy = vi.spyOn(syncClient, 'mutation');

    expect(await syncNote(editedNote)).toEqual({
      callRecordingId,
      created: false,
      skipped: true,
    });
    expect(querySpy).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ callRecordings: expect.anything() }),
    );
    expect(mutationSpy).not.toHaveBeenCalled();
    expect(
      await selectGranolaNotesToSyncOrThrow({
        coreApiClient: syncClient,
        notes: [editedNote, newNote],
      }),
    ).toEqual([newNote.id]);
    expect(await findSyncState(callRecordingId)).toEqual({
      id: callRecordingId,
      deletedAt: expect.any(String),
      granolaNoteUpdatedAt: note.updated_at,
    });
  });
});

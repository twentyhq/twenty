import { randomUUID } from 'node:crypto';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { buildGranolaNote } from 'src/__tests__/utils/build-granola-note.util';
import { buildGranolaTranscriptItem } from 'src/__tests__/utils/build-granola-transcript-item.util';
import { type GranolaNote } from 'src/logic-functions/types/granola-api.type';
import { computeCallRecordingIdForGranolaNote } from 'src/logic-functions/utils/compute-call-recording-id-for-granola-note.util';
import { findCallRecordingSyncStatesOrThrow } from 'src/logic-functions/utils/find-call-recording-sync-states-or-throw.util';
import { selectGranolaNotesToSyncOrThrow } from 'src/logic-functions/utils/select-granola-notes-to-sync-or-throw.util';
import { syncGranolaNoteToCallRecordingOrThrow } from 'src/logic-functions/utils/sync-granola-note-to-call-recording-or-throw.util';
import { updateCallRecordingOrThrow } from 'src/logic-functions/utils/update-call-recording-or-throw.util';

const EDITED_NOTE_UPDATED_AT = '2026-09-06T09:00:00Z';
const coreApiClient = new CoreApiClient();
const createdCallRecordingIds: string[] = [];

const buildCompleteNote = (overrides: Partial<GranolaNote> = {}) =>
  buildGranolaNote({
    id: `not_${randomUUID().replace(/-/g, '').slice(0, 14)}`,
    transcript: [buildGranolaTranscriptItem()],
    ...overrides,
  });

const syncNote = async (note: GranolaNote) => {
  const result = await syncGranolaNoteToCallRecordingOrThrow({
    coreApiClient,
    client: {
      getNote: vi.fn().mockResolvedValue(note),
      listTranscriptPage: vi.fn(),
    },
    noteId: note.id,
    shouldSkipUnchangedNote: true,
  });

  if (result.created) {
    createdCallRecordingIds.push(result.callRecordingId);
  }

  return result;
};

const findSyncState = async (callRecordingId: string) =>
  (
    await findCallRecordingSyncStatesOrThrow({
      coreApiClient,
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

afterEach(async () => {
  vi.restoreAllMocks();

  for (const callRecordingId of createdCallRecordingIds.splice(0)) {
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

    const mutationSpy = vi.spyOn(coreApiClient, 'mutation');

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
      coreApiClient,
      callRecordingIds: [liveCallRecordingId, deletedCallRecordingId],
    });

    expect(syncStates.get(liveCallRecordingId)?.deletedAt).toBeNull();
    expect(syncStates.get(deletedCallRecordingId)?.deletedAt).toEqual(
      expect.any(String),
    );
  });

  it('neither updates nor resurrects a soft-deleted recording', async () => {
    const note = buildCompleteNote();
    const editedNote = {
      ...note,
      title: 'Renamed meeting',
      updated_at: EDITED_NOTE_UPDATED_AT,
    };
    const newNote = buildCompleteNote();
    const callRecordingId = computeCallRecordingIdForGranolaNote(note.id);

    await syncNote(note);
    await softDelete(callRecordingId);

    expect(
      await updateCallRecordingOrThrow({
        coreApiClient,
        callRecordingId,
        fields: { title: 'Renamed meeting' },
      }),
    ).toBe(false);
    expect(await syncNote(editedNote)).toEqual({
      callRecordingId,
      created: false,
      skipped: true,
    });
    expect(
      await selectGranolaNotesToSyncOrThrow({
        coreApiClient,
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

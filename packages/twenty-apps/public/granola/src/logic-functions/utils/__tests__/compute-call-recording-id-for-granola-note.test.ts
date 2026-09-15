import { expect, it } from 'vitest';

import { computeCallRecordingIdForGranolaNote } from 'src/logic-functions/utils/compute-call-recording-id-for-granola-note.util';

it('derives stable UUID v4 identities from the Granola namespace', () => {
  const noteId = 'not_1d3tmYTlCICgjy';
  const recordingId = computeCallRecordingIdForGranolaNote(noteId);

  expect(recordingId).toMatch(
    /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/,
  );
  expect(computeCallRecordingIdForGranolaNote(noteId)).toBe(recordingId);
  expect(computeCallRecordingIdForGranolaNote('not_another')).not.toBe(
    recordingId,
  );
});

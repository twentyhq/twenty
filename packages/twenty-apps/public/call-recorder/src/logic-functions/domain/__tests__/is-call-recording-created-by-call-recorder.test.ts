import { describe, expect, it } from 'vitest';

import { isCallRecordingCreatedByCallRecorder } from 'src/logic-functions/domain/is-call-recording-created-by-call-recorder.util';

describe('isCallRecordingCreatedByCallRecorder', () => {
  it('accepts the app-stamped actor', () => {
    expect(
      isCallRecordingCreatedByCallRecorder({
        source: 'APPLICATION',
        name: 'Call Recorder',
      }),
    ).toBe(true);
  });

  it('rejects records created by users', () => {
    expect(
      isCallRecordingCreatedByCallRecorder({
        source: 'MANUAL',
        name: 'Alex',
      }),
    ).toBe(false);
  });

  it('rejects records created by another application', () => {
    expect(
      isCallRecordingCreatedByCallRecorder({
        source: 'APPLICATION',
        name: 'Fireflies',
      }),
    ).toBe(false);
  });

  it('rejects records with no actor data', () => {
    expect(isCallRecordingCreatedByCallRecorder({})).toBe(false);
  });
});

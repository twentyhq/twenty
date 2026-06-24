import { STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';
import { describe, expect, it } from 'vitest';

import { CALL_RECORDING_AUDIO_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/call-recording-audio-field-universal-identifier';
import { CALL_RECORDING_VIDEO_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/call-recording-video-field-universal-identifier';

// This test is nothing more than a sanity check to ensure that the universal identifiers for the call recording media fields are correct.
describe('call recording field universal identifiers', () => {
  it('matches the standard CallRecording media field identifiers', () => {
    expect(CALL_RECORDING_AUDIO_FIELD_UNIVERSAL_IDENTIFIER).toBe(
      STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.callRecording.fields.audio
        .universalIdentifier,
    );
    expect(CALL_RECORDING_VIDEO_FIELD_UNIVERSAL_IDENTIFIER).toBe(
      STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.callRecording.fields.video
        .universalIdentifier,
    );
  });
});

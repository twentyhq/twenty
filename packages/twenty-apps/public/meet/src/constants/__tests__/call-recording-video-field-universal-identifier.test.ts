import { STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';
import { describe, expect, it } from 'vitest';

import { CALL_RECORDING_VIDEO_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

describe('CALL_RECORDING_VIDEO_FIELD_UNIVERSAL_IDENTIFIER', () => {
  it('should match the standard Call Recording video field', () => {
    expect(CALL_RECORDING_VIDEO_FIELD_UNIVERSAL_IDENTIFIER).toBe(
      STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.callRecording.fields.video
        .universalIdentifier,
    );
  });
});

import { describe, expect, it } from 'vitest';

import { getCallRecordingStatusTag } from 'src/front-components/utils/get-call-recording-status-tag.util';

describe('getCallRecordingStatusTag', () => {
  it('tags a call that is still being recorded', () => {
    expect(getCallRecordingStatusTag('RECORDING')).toEqual({
      text: 'Recording',
      color: 'red',
    });
  });

  it('tags a call that is still being processed', () => {
    expect(getCallRecordingStatusTag('PROCESSING')).toEqual({
      text: 'Processing',
      color: 'orange',
    });
  });

  it.each(['COMPLETED', 'FAILED', 'SCHEDULED', null, undefined])(
    'shows no tag for %j, so the duration is shown instead',
    (status) => {
      expect(getCallRecordingStatusTag(status)).toBeUndefined();
    },
  );
});

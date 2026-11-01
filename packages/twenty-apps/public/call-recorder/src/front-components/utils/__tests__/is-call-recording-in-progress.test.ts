import { describe, expect, it } from 'vitest';

import { type CallRecordingNode } from 'src/front-components/types/call-recording-node.type';
import { isCallRecordingInProgress } from 'src/front-components/utils/is-call-recording-in-progress.util';

const buildCallRecording = (status: string | null): CallRecordingNode => ({
  id: 'call-recording',
  status,
});

describe('isCallRecordingInProgress', () => {
  it.each(['RECORDING', 'PROCESSING'])('is true for %s', (status) => {
    expect(isCallRecordingInProgress(buildCallRecording(status))).toBe(true);
  });

  it.each(['COMPLETED', null])('is false for %s', (status) => {
    expect(isCallRecordingInProgress(buildCallRecording(status))).toBe(false);
  });
});

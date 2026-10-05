import { describe, expect, it } from 'vitest';

import { parseCallRecordingForArtifactsImportNode } from 'src/logic-functions/data/parse-call-recording-for-artifacts-import-node.util';

describe('parseCallRecordingForArtifactsImportNode', () => {
  it('returns undefined for a missing node or one without an id', () => {
    expect(parseCallRecordingForArtifactsImportNode(undefined)).toBeUndefined();
    expect(parseCallRecordingForArtifactsImportNode(null)).toBeUndefined();
    expect(
      parseCallRecordingForArtifactsImportNode({ status: 'PROCESSING' }),
    ).toBeUndefined();
  });

  it('reads nullable fields as undefined', () => {
    expect(
      parseCallRecordingForArtifactsImportNode({
        id: 'call-recording-1',
        status: 'PROCESSING',
        startedAt: null,
        endedAt: null,
        externalBotId: 'bot-1',
        externalRecordingId: null,
        callRecorderFailureReason: null,
        transcript: null,
        audio: null,
        video: [{ fileId: 'file-1' }],
      }),
    ).toEqual({
      id: 'call-recording-1',
      status: 'PROCESSING',
      startedAt: undefined,
      endedAt: undefined,
      externalBotId: 'bot-1',
      externalRecordingId: undefined,
      callRecorderFailureReason: undefined,
      transcript: undefined,
      audio: undefined,
      video: [{ fileId: 'file-1' }],
    });
  });
});

import { describe, expect, it } from 'vitest';

import {
  fathomImportMediaDownloadPayloadSchema,
  fathomRequestMediaDownloadPayloadSchema,
} from 'src/logic-functions/schemas/fathom-media-download-payload.schema';

describe('fathom media download payload schemas', () => {
  it('accepts a local call recording identifier', () => {
    expect(
      fathomRequestMediaDownloadPayloadSchema.safeParse({
        callRecordingId: 'call-recording-id',
      }).success,
    ).toBe(true);
  });

  it('accepts a generation-fenced poll payload', () => {
    expect(
      fathomImportMediaDownloadPayloadSchema.safeParse({
        callRecordingId: 'call-recording-id',
        downloadId: 'download-id',
        attempt: 0,
      }).success,
    ).toBe(true);
  });

  it('rejects a poll payload without its download generation', () => {
    expect(
      fathomImportMediaDownloadPayloadSchema.safeParse({
        callRecordingId: 'call-recording-id',
        attempt: 0,
      }).success,
    ).toBe(false);
  });

  it.each([-1, 0.5, Number.NaN])(
    'rejects invalid poll attempt %s',
    (attempt) => {
      expect(
        fathomImportMediaDownloadPayloadSchema.safeParse({
          callRecordingId: 'call-recording-id',
          downloadId: 'download-id',
          attempt,
        }).success,
      ).toBe(false);
    },
  );
});

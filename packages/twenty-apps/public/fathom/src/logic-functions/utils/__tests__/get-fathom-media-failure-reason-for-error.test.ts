import { FathomError } from 'fathom-typescript/sdk/models/errors';
import { describe, expect, it } from 'vitest';

import { getFathomMediaFailureReasonForError } from 'src/logic-functions/utils/get-fathom-media-failure-reason-for-error.util';

describe('getFathomMediaFailureReasonForError', () => {
  it.each([
    [403, 'download_forbidden'],
    [422, 'no_downloadable_media'],
    [404, undefined],
    [429, undefined],
    [503, undefined],
  ])('classifies Fathom status %i as %s', (status, expectedReason) => {
    const error = new FathomError('Download request failed', {
      request: new Request('https://api.fathom.ai/external/v1/recordings/1'),
      response: new Response(null, { status }),
      body: '',
    });

    expect(getFathomMediaFailureReasonForError(error)).toBe(expectedReason);
  });

  it.each([undefined, null, new Error('Upload failed'), { statusCode: 403 }])(
    'does not classify unrelated errors: %s',
    (error) => {
      expect(getFathomMediaFailureReasonForError(error)).toBeUndefined();
    },
  );
});

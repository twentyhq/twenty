import { isOffloadedJobPayload } from 'src/engine/core-modules/message-queue/drivers/payload/is-offloaded-job-payload.util';

const REFERENCE = {
  path: 'ws/job-payloads/q/id.json',
  sizeBytes: 10,
  sha256: 'abc',
};

describe('isOffloadedJobPayload', () => {
  it('recognizes a reference', () => {
    expect(isOffloadedJobPayload({ __offloadedJobPayload: REFERENCE })).toBe(
      true,
    );
  });

  it.each([
    ['inline data', { workspaceId: 'ws', payload: 'x' }],
    [
      'a reference mixed with other fields',
      { __offloadedJobPayload: REFERENCE, workspaceId: 'ws' },
    ],
    ['an incomplete reference', { __offloadedJobPayload: { path: 'p' } }],
    ['undefined', undefined],
  ])('rejects %s', (_, data) => {
    expect(isOffloadedJobPayload(data)).toBe(false);
  });
});

import { describe, expect, it } from 'vitest';

import { isCallRecordingStatusDowngrade } from 'src/logic-functions/domain/is-call-recording-status-downgrade.util';

describe('isCallRecordingStatusDowngrade', () => {
  it.each([
    ['SCHEDULED', 'JOINING', false],
    ['JOINING', 'RECORDING', false],
    ['RECORDING', 'PROCESSING', false],
    ['PROCESSING', 'FAILED', false],
    ['PROCESSING', 'COMPLETED', false],
    ['RECORDING', 'RECORDING', false],
    ['COMPLETED', 'RECORDING', true],
    ['PROCESSING', 'JOINING', true],
    ['FAILED', 'RECORDING', true],
    ['JOINING', 'SCHEDULED', true],
    ['PROCESSING', 'NOT_ATTENDED', false],
    ['NOT_ATTENDED', 'COMPLETED', false],
    ['NOT_ATTENDED', 'FAILED', false],
    ['FAILED', 'NOT_ATTENDED', false],
    ['NOT_ATTENDED', 'PROCESSING', true],
    ['COMPLETED', 'NOT_ATTENDED', true],
  ])('from %s to %s -> %s', (fromStatus, toStatus, expected) => {
    expect(isCallRecordingStatusDowngrade({ fromStatus, toStatus })).toBe(
      expected,
    );
  });

  it('never treats transitions from unknown statuses as downgrades', () => {
    expect(
      isCallRecordingStatusDowngrade({
        fromStatus: undefined,
        toStatus: 'COMPLETED',
      }),
    ).toBe(false);
    expect(
      isCallRecordingStatusDowngrade({
        fromStatus: 'NOT_A_STATUS',
        toStatus: 'SCHEDULED',
      }),
    ).toBe(false);
  });
});

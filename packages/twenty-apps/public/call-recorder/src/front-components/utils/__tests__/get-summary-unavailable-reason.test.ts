import { describe, expect, it } from 'vitest';

import { getSummaryUnavailableReason } from 'src/front-components/utils/get-summary-unavailable-reason.util';

describe('getSummaryUnavailableReason', () => {
  it('returns undefined when there are no call recordings', () => {
    expect(getSummaryUnavailableReason([])).toBeUndefined();
  });

  it('returns undefined when the recording is completed without a summary', () => {
    expect(
      getSummaryUnavailableReason([
        { status: 'COMPLETED', callRecorderFailureReason: null },
      ]),
    ).toBeUndefined();
  });

  it('explains that the recording is still being processed', () => {
    expect(
      getSummaryUnavailableReason([
        { status: 'PROCESSING', callRecorderFailureReason: null },
      ]),
    ).toBe(
      'The recording is still being processed. The summary will appear here once it is ready.',
    );
  });

  it('explains that the recording is in progress while recording', () => {
    expect(
      getSummaryUnavailableReason([
        { status: 'RECORDING', callRecorderFailureReason: null },
      ]),
    ).toBe(
      'The recording is in progress. The summary will be available once the call ends.',
    );
  });

  it('explains that the recording is in progress while joining', () => {
    expect(
      getSummaryUnavailableReason([
        { status: 'JOINING', callRecorderFailureReason: null },
      ]),
    ).toBe(
      'The recording is in progress. The summary will be available once the call ends.',
    );
  });

  it('explains that the recording is scheduled', () => {
    expect(
      getSummaryUnavailableReason([
        { status: 'SCHEDULED', callRecorderFailureReason: null },
      ]),
    ).toBe(
      'The recording is scheduled. The summary will be available once the call has been recorded.',
    );
  });

  it('explains that the recording failed without a provider reason', () => {
    expect(
      getSummaryUnavailableReason([
        { status: 'FAILED', callRecorderFailureReason: null },
      ]),
    ).toBe('The recording failed, so no summary could be generated.');
  });

  it('includes the provider failure reason when the recording failed', () => {
    expect(
      getSummaryUnavailableReason([
        {
          status: 'FAILED',
          callRecorderFailureReason: '  video_file_too_large  ',
        },
      ]),
    ).toBe(
      'The recording failed, so no summary could be generated. Reason: video_file_too_large',
    );
  });

  it('prioritizes an in-progress retry over an earlier failed attempt', () => {
    expect(
      getSummaryUnavailableReason([
        { status: 'FAILED', callRecorderFailureReason: 'left_waiting_room' },
        { status: 'RECORDING', callRecorderFailureReason: null },
      ]),
    ).toBe(
      'The recording is in progress. The summary will be available once the call ends.',
    );
  });
});

import { describe, expect, it } from 'vitest';

import { getDeletedAndCompletedCallRecordingIds } from 'src/features/transcripts/logic-functions/utils/get-deleted-and-completed-call-recording-ids';

describe('getDeletedAndCompletedCallRecordingIds', () => {
  it('should keep deleted recordings apart from the completed ones still in Twenty', () => {
    expect(
      getDeletedAndCompletedCallRecordingIds([
        { id: 'completed', status: 'COMPLETED', deletedAt: null },
        { id: 'processing', status: 'PROCESSING', deletedAt: null },
        {
          id: 'deleted-completed',
          status: 'COMPLETED',
          deletedAt: '2026-09-01T00:00:00.000Z',
        },
        {
          id: 'deleted-processing',
          status: 'PROCESSING',
          deletedAt: '2026-09-01T00:00:00.000Z',
        },
      ]),
    ).toEqual({
      deletedCallRecordingIds: new Set([
        'deleted-completed',
        'deleted-processing',
      ]),
      completedCallRecordingIds: new Set(['completed']),
    });
  });
});

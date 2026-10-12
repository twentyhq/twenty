import { describe, expect, it } from 'vitest';

import { getDeletedAndCompletedCallRecordingIds } from 'src/features/transcripts/logic-functions/utils/get-deleted-and-completed-call-recording-ids';

const CREATED_AT = '2026-08-01T00:00:00.000Z';

describe('getDeletedAndCompletedCallRecordingIds', () => {
  it('should keep deleted recordings apart from the completed ones still in Twenty', () => {
    expect(
      getDeletedAndCompletedCallRecordingIds({
        callRecordings: [
          {
            id: 'completed',
            status: 'COMPLETED',
            createdAt: CREATED_AT,
            deletedAt: null,
          },
          {
            id: 'processing',
            status: 'PROCESSING',
            createdAt: CREATED_AT,
            deletedAt: null,
          },
          {
            id: 'deleted-completed',
            status: 'COMPLETED',
            createdAt: CREATED_AT,
            deletedAt: '2026-09-01T00:00:00.000Z',
          },
          {
            id: 'deleted-processing',
            status: 'PROCESSING',
            createdAt: CREATED_AT,
            deletedAt: '2026-09-01T00:00:00.000Z',
          },
        ],
      }),
    ).toEqual({
      deletedCallRecordingIds: new Set([
        'deleted-completed',
        'deleted-processing',
      ]),
      completedCallRecordingIds: new Set(['completed']),
      importedCallRecordingIds: new Set(),
    });
  });

  it('should tell completed recordings created since the run started apart from older ones', () => {
    expect(
      getDeletedAndCompletedCallRecordingIds({
        callRecordings: [
          {
            id: 'completed-before-run',
            status: 'COMPLETED',
            createdAt: '2026-09-14T23:59:59.000Z',
            deletedAt: null,
          },
          {
            id: 'completed-during-run',
            status: 'COMPLETED',
            createdAt: '2026-09-15T00:00:00.000Z',
            deletedAt: null,
          },
        ],
        importedSince: '2026-09-15T00:00:00.000Z',
      }),
    ).toEqual({
      deletedCallRecordingIds: new Set(),
      completedCallRecordingIds: new Set(['completed-before-run']),
      importedCallRecordingIds: new Set(['completed-during-run']),
    });
  });
});

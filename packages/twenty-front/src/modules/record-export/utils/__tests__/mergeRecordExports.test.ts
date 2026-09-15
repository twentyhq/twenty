import { mergeRecordExports } from '@/record-export/utils/mergeRecordExports';
import { type RecordExportSummary } from '@/record-export/types/RecordExportSummary';
import { RecordExportStatus } from '~/generated-metadata/graphql';

describe('mergeRecordExports', () => {
  const recordExport = (
    status: RecordExportStatus,
    updatedAt: string,
  ): RecordExportSummary => ({
    id: 'export',
    workspaceId: 'workspace',
    workspaceMemberId: 'member',
    filename: 'people.csv',
    status,
    processedRecordCount: 50,
    errorMessage: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt,
    expiresAt: '2999-01-01T00:00:00.000Z',
  });

  it('does not let a slow status fetch overwrite a newer completion event', () => {
    const completed = recordExport(
      RecordExportStatus.COMPLETED,
      '2026-01-01T00:00:03.000Z',
    );
    const processing = recordExport(
      RecordExportStatus.PROCESSING,
      '2026-01-01T00:00:02.000Z',
    );
    expect(mergeRecordExports([completed], [processing])).toEqual([completed]);
  });

  it('recovers completion from a refresh after missing the SSE event', () => {
    const processing = recordExport(
      RecordExportStatus.PROCESSING,
      '2026-01-01T00:00:02.000Z',
    );
    const completed = recordExport(
      RecordExportStatus.COMPLETED,
      '2026-01-01T00:00:03.000Z',
    );
    expect(mergeRecordExports([processing], [completed])).toEqual([completed]);
  });

  it('keeps completion when timestamps lose database sub-millisecond precision', () => {
    const completed = recordExport(
      RecordExportStatus.COMPLETED,
      '2026-01-01T00:00:03.000Z',
    );
    const processing = recordExport(
      RecordExportStatus.PROCESSING,
      completed.updatedAt,
    );
    expect(mergeRecordExports([completed], [processing])).toEqual([completed]);
  });

  it('removes expired downloads', () => {
    expect(
      mergeRecordExports(
        [],
        [
          {
            ...recordExport(
              RecordExportStatus.COMPLETED,
              '2026-01-01T00:00:03.000Z',
            ),
            expiresAt: '2000-01-01T00:00:00.000Z',
          },
        ],
      ),
    ).toEqual([]);
  });
});

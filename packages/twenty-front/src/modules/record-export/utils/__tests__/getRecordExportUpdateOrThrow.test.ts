import { getRecordExportUpdateOrThrow } from '@/record-export/utils/getRecordExportUpdateOrThrow';
import { RecordExportStatus } from '~/generated-metadata/graphql';

const recordExport = {
  id: 'export',
  filename: 'person.csv',
  status: RecordExportStatus.PROCESSING,
  processedRecordCount: 42,
  totalRecordCount: 100,
};

describe('getRecordExportUpdateOrThrow', () => {
  it.each([
    { totalRecordCount: null, processedRecordCount: 0, progress: 0 },
    { totalRecordCount: 0, processedRecordCount: 0, progress: 0 },
    { totalRecordCount: 100, processedRecordCount: 42, progress: 42 },
    { totalRecordCount: 100, processedRecordCount: 100, progress: 99 },
    { totalRecordCount: 100, processedRecordCount: 110, progress: 99 },
  ])(
    'reports $progress percent before the file is ready',
    ({ progress, ...counts }) => {
      expect(
        getRecordExportUpdateOrThrow({ ...recordExport, ...counts }),
      ).toEqual({
        progress,
      });
    },
  );

  it('downloads only a completed export with a URL', () => {
    const completed = { ...recordExport, status: RecordExportStatus.COMPLETED };
    expect(() => getRecordExportUpdateOrThrow(completed)).toThrow(
      'could not be downloaded',
    );
    expect(
      getRecordExportUpdateOrThrow({ ...completed, downloadUrl: '/download' }),
    ).toEqual({
      progress: 100,
      download: { url: '/download', filename: 'person.csv' },
    });
  });

  it('surfaces the server failure', () => {
    expect(() =>
      getRecordExportUpdateOrThrow({
        ...recordExport,
        status: RecordExportStatus.FAILED,
        errorMessage: 'Permission revoked',
      }),
    ).toThrow('Permission revoked');
  });
});

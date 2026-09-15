import { getRecordExportUpdate } from '@/record-export/utils/getRecordExportUpdate';
import { RecordExportStatus } from '~/generated-metadata/graphql';

const recordExport = {
  id: 'export',
  filename: 'person.csv',
  status: RecordExportStatus.PROCESSING,
  processedRecordCount: 42,
  totalRecordCount: 100,
};

describe('getRecordExportUpdate', () => {
  it.each([
    { totalRecordCount: null, processedRecordCount: 0, progress: 0 },
    { totalRecordCount: 0, processedRecordCount: 0, progress: 0 },
    { totalRecordCount: 100, processedRecordCount: 42, progress: 42 },
    { totalRecordCount: 100, processedRecordCount: 100, progress: 99 },
    { totalRecordCount: 100, processedRecordCount: 110, progress: 99 },
  ])(
    'reports $progress percent before the file is ready',
    ({ progress, ...counts }) => {
      expect(getRecordExportUpdate({ ...recordExport, ...counts })).toEqual({
        progress,
      });
    },
  );

  it('downloads only a completed export with a URL', () => {
    const completed = { ...recordExport, status: RecordExportStatus.COMPLETED };
    expect(() => getRecordExportUpdate(completed)).toThrow(
      'could not be downloaded',
    );
    expect(
      getRecordExportUpdate({ ...completed, downloadUrl: '/download' }),
    ).toEqual({
      progress: 100,
      download: { url: '/download', filename: 'person.csv' },
    });
  });

  it('surfaces the server failure', () => {
    expect(() =>
      getRecordExportUpdate({
        ...recordExport,
        status: RecordExportStatus.FAILED,
        errorMessage: 'Permission revoked',
      }),
    ).toThrow('Permission revoked');
  });
});

import { act, renderHook } from '@testing-library/react';
import { type ExecutionResult } from 'graphql';
import { createClient, type Sink } from 'graphql-sse';
import { useExportRecords } from '@/record-export/hooks/useExportRecords';
import {
  RecordExportStatus,
  type ExportRecordsSubscription,
} from '~/generated-metadata/graphql';

jest.mock('graphql-sse', () => ({ createClient: jest.fn() }));

const assign = jest.fn();

describe('useExportRecords', () => {
  let sink: Sink<ExecutionResult<ExportRecordsSubscription>>;
  const dispose = jest.fn();
  const input = { objectMetadataId: 'person', fieldMetadataIds: ['name'] };
  const onProgress = jest.fn();
  const emit = (fields: Partial<ExportRecordsSubscription['exportRecords']>) =>
    sink.next({
      data: {
        exportRecords: {
          id: 'export',
          filename: 'person.csv',
          status: RecordExportStatus.PROCESSING,
          processedRecordCount: 0,
          totalRecordCount: null,
          ...fields,
        },
      },
    });
  beforeAll(() => {
    jest
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(function (this: HTMLAnchorElement) {
        assign(this.getAttribute('href'));
      });
  });
  afterAll(() => {
    jest.restoreAllMocks();
  });
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(createClient).mockReturnValue({
      dispose,
      subscribe: (
        _request: unknown,
        observer: Sink<ExecutionResult<ExportRecordsSubscription>>,
      ) => {
        sink = observer;
        return jest.fn();
      },
    } as unknown as ReturnType<typeof createClient>);
  });

  it('shows percentage progress and automatically downloads only after completion', async () => {
    const { result } = renderHook(() => useExportRecords({ onProgress }));
    let exporting: Promise<void>;
    act(() => {
      exporting = result.current.exportRecords(input);
    });
    act(() => emit({ processedRecordCount: 42, totalRecordCount: 100 }));
    expect(onProgress).toHaveBeenLastCalledWith(42);
    act(() => emit({ processedRecordCount: 100, totalRecordCount: 100 }));
    expect(onProgress).toHaveBeenLastCalledWith(99);
    expect(assign).not.toHaveBeenCalled();
    await act(async () => {
      emit({
        status: RecordExportStatus.COMPLETED,
        downloadUrl: '/record-exports/export/download?token=token',
      });
      await exporting;
    });
    expect(assign).toHaveBeenCalledTimes(1);
    expect(assign).toHaveBeenCalledWith(
      '/record-exports/export/download?token=token',
    );
    expect(onProgress).toHaveBeenLastCalledWith(100);
    emit({ status: RecordExportStatus.COMPLETED, downloadUrl: '/duplicate' });
    expect(assign).toHaveBeenCalledTimes(1);
  });

  it('ends the export on connection loss without reconnecting or downloading', async () => {
    const { result } = renderHook(() => useExportRecords({ onProgress }));
    const exporting = result.current.exportRecords(input);
    sink.error(new Error('Disconnected'));
    await expect(exporting).rejects.toThrow('connection was lost');
    expect(createClient).toHaveBeenCalledWith(
      expect.objectContaining({ retryAttempts: 0 }),
    );
    expect(assign).not.toHaveBeenCalled();
    expect(dispose).toHaveBeenCalled();
  });

  it.each(['unmount', 'pagehide'])(
    'cancels on %s and ignores late completion events',
    async (action) => {
      const { result, unmount } = renderHook(() =>
        useExportRecords({ onProgress }),
      );
      const exporting = result.current.exportRecords(input);
      if (action === 'unmount') unmount();
      else window.dispatchEvent(new Event('pagehide'));
      await exporting;
      emit({ status: RecordExportStatus.COMPLETED, downloadUrl: '/late' });
      expect(assign).not.toHaveBeenCalled();
      expect(dispose).toHaveBeenCalled();
    },
  );

  it('surfaces server failures and permits a fresh export attempt', async () => {
    const { result } = renderHook(() => useExportRecords({ onProgress }));
    const first = result.current.exportRecords(input);
    emit({ status: RecordExportStatus.FAILED, errorMessage: 'Export failed' });
    await expect(first).rejects.toThrow('Export failed');
    const next = result.current.exportRecords(input);
    emit({ status: RecordExportStatus.COMPLETED, downloadUrl: '/new-file' });
    await next;
    expect(assign).toHaveBeenCalledWith('/new-file');
  });
});

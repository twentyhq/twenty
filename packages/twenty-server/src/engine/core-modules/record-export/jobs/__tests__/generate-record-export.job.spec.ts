import { getRecordExportMock } from 'src/engine/core-modules/record-export/mocks/record-export.mock';
import { Readable } from 'stream';
import { FieldMetadataType } from 'twenty-shared/types';

import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { RecordExportStatus } from 'src/engine/core-modules/record-export/enums/record-export-status.enum';
import { GenerateRecordExportJob } from 'src/engine/core-modules/record-export/jobs/generate-record-export.job';
import { type RecordExport } from 'src/engine/core-modules/record-export/types/record-export.type';
import { RecordExportQueryWorkspaceService } from 'src/engine/core-modules/record-export/services/record-export-query.workspace-service';
import { RecordExportWorkspaceService } from 'src/engine/core-modules/record-export/services/record-export.workspace-service';
import { RecordExportCacheService } from 'src/engine/core-modules/record-export/services/record-export-cache.service';

describe('GenerateRecordExportJob', () => {
  let recordExport: RecordExport;
  let output: string;
  const cache = { update: jest.fn() };
  const exportService = {
    findOrThrow: jest.fn(),
    getFileResource: jest.fn(),
  };
  const queryService = {
    resolveRequester: jest.fn(),
    buildContext: jest.fn(),
    readPage: jest.fn(),
    countRecords: jest.fn(),
  };
  const storage = { writeFileStream: jest.fn(), deleteFileObject: jest.fn() };
  const job = new GenerateRecordExportJob(
    cache as unknown as RecordExportCacheService,
    exportService as unknown as RecordExportWorkspaceService,
    queryService as unknown as RecordExportQueryWorkspaceService,
    storage as unknown as FileStorageService,
  );

  beforeEach(() => {
    jest.useRealTimers();
    jest.resetAllMocks();
    output = '';
    queryService.countRecords.mockResolvedValue(1002);
    recordExport = getRecordExportMock({
      id: 'export',
      workspaceId: 'workspace',
      userWorkspaceId: 'requester',
      status: RecordExportStatus.QUEUED,
      createdAt: new Date(),
      parameters: { objectMetadataId: 'object', fieldMetadataIds: ['name'] },
    });
    cache.update.mockImplementation(
      async (
        _workspaceId: string,
        _id: string,
        _criteria: object,
        values: object,
      ) => {
        Object.assign(recordExport, values);
        return true;
      },
    );
    exportService.findOrThrow.mockImplementation(async () => recordExport);
    exportService.getFileResource.mockImplementation(
      (workspaceId: string, resourcePath: string) => ({
        workspaceId,
        resourcePath,
      }),
    );
    queryService.resolveRequester.mockResolvedValue({
      type: 'user',
      userWorkspaceId: 'requester',
    });
    queryService.buildContext.mockResolvedValue({
      queryRunnerContext: {},
      columns: [
        { fieldName: 'id', type: FieldMetadataType.UUID, label: 'Id' },
        { fieldName: 'name', type: FieldMetadataType.TEXT, label: '=Name' },
      ],
    });
    storage.writeFileStream.mockImplementation(
      async ({ stream }: { stream: Readable }) => {
        for await (const chunk of stream) output += chunk.toString();
      },
    );
    storage.deleteFileObject.mockResolvedValue(undefined);
  });

  it('streams all pages, including more than the old request limit, and completes only after upload', async () => {
    let page = 0;
    queryService.readPage.mockImplementation(
      async (_parameters: object, _context: object, cursor?: string) => {
        expect(cursor).toBe(page === 0 ? undefined : String(page));
        page++;
        return {
          results: {
            records: [{ id: String(page), name: 'Ada' }],
            pageInfo: { hasNextPage: page < 1002, endCursor: String(page) },
          },
        };
      },
    );
    await job.handle({ workspaceId: 'workspace', recordExportId: 'export' });
    expect(page).toBe(1002);
    expect(output.startsWith('\uFEFFId,\u200D=Name\n')).toBe(true);
    expect(output.endsWith('1002,Ada\n')).toBe(true);
    expect(recordExport.status).toBe(RecordExportStatus.COMPLETED);
    expect(recordExport.processedRecordCount).toBe(1002);
    expect(recordExport.filePath).toMatch(/^export\/.+\.csv$/);
  });

  it('exports headers for an empty result', async () => {
    queryService.readPage.mockResolvedValue({
      results: { records: [], pageInfo: { hasNextPage: false } },
    });
    await job.handle({ workspaceId: 'workspace', recordExportId: 'export' });
    expect(output).toBe('\uFEFFId,\u200D=Name\n');
    expect(recordExport.processedRecordCount).toBe(0);
  });

  it('fails and removes partial output when upload fails', async () => {
    queryService.readPage.mockResolvedValue({
      results: { records: [], pageInfo: { hasNextPage: false } },
    });
    storage.writeFileStream.mockRejectedValue(new Error('Storage unavailable'));
    await expect(
      job.handle({ workspaceId: 'workspace', recordExportId: 'export' }),
    ).rejects.toThrow('Storage unavailable');
    expect(recordExport.status).toBe(RecordExportStatus.FAILED);
    expect(recordExport.filePath).toBeNull();
    expect(storage.deleteFileObject).toHaveBeenCalledTimes(1);
  });

  it('never publishes an incomplete file when pagination cannot advance', async () => {
    queryService.readPage.mockResolvedValue({
      results: {
        records: [],
        pageInfo: { hasNextPage: true, endCursor: 'same' },
      },
    });
    await expect(
      job.handle({ workspaceId: 'workspace', recordExportId: 'export' }),
    ).rejects.toThrow('pagination did not advance');
    expect(recordExport.status).toBe(RecordExportStatus.FAILED);
  });

  it('does not rerun a completed or failed export', async () => {
    cache.update.mockResolvedValue(false);
    await job.handle({ workspaceId: 'workspace', recordExportId: 'export' });
    expect(storage.writeFileStream).not.toHaveBeenCalled();
  });

  it('stops when another attempt replaces its ownership', async () => {
    queryService.readPage.mockResolvedValue({
      results: { records: [], pageInfo: { hasNextPage: false } },
    });
    cache.update.mockResolvedValueOnce(true).mockResolvedValue(false);
    await expect(
      job.handle({ workspaceId: 'workspace', recordExportId: 'export' }),
    ).rejects.toThrow('superseded');
    expect(storage.writeFileStream).not.toHaveBeenCalled();
  });
  it('removes partial output if requester access is revoked between pages', async () => {
    queryService.readPage.mockResolvedValue({
      results: {
        records: [{ id: '1', name: 'Ada' }],
        pageInfo: { hasNextPage: true, endCursor: 'next' },
      },
    });
    queryService.resolveRequester
      .mockResolvedValueOnce({ type: 'user' })
      .mockResolvedValueOnce({ type: 'user' })
      .mockRejectedValue(new Error('Access revoked'));
    await expect(
      job.handle({ workspaceId: 'workspace', recordExportId: 'export' }),
    ).rejects.toThrow('Access revoked');
    expect(queryService.readPage).toHaveBeenCalledTimes(1);
    expect(recordExport.status).toBe(RecordExportStatus.FAILED);
    expect(recordExport.filePath).toBeNull();
    expect(storage.deleteFileObject).toHaveBeenCalledTimes(1);
  });

  it('fails an export that exceeded the deadline before starting', async () => {
    recordExport.createdAt = new Date(Date.now() - 2 * 3600_000);
    await expect(
      job.handle({ workspaceId: 'workspace', recordExportId: 'export' }),
    ).rejects.toThrow('too long');
    expect(recordExport.status).toBe(RecordExportStatus.FAILED);
    expect(queryService.readPage).not.toHaveBeenCalled();
  });
});

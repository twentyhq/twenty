import { FileFolder } from 'twenty-shared/types';
import { In } from 'typeorm';

import { type WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { BackfillLogicFunctionFileRowsCommand } from 'src/database/commands/upgrade-version-command/2-43/2-43-workspace-command-1790262034322-backfill-logic-function-file-rows.command';
import { type FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { type FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { type WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const WORKSPACE_ID = '20202020-0000-0000-0000-000000000001';
const APPLICATION = {
  id: '20202020-0000-0000-0000-0000000000aa',
  universalIdentifier: '20202020-0000-0000-0000-0000000000bb',
  deletedAt: null,
};
const LOGIC_FUNCTION_ID = '20202020-0000-0000-0000-000000000010';

const SOURCE_FILE_PATH = `source/${LOGIC_FUNCTION_ID}/src/index.ts`;
const BUILT_FILE_PATH = `built-logic-function/${LOGIC_FUNCTION_ID}/src/index.mjs`;

describe('BackfillLogicFunctionFileRowsCommand', () => {
  let command: BackfillLogicFunctionFileRowsCommand;
  let findFileRowsMock: jest.Mock;
  let getFileMetadataMock: jest.Mock;
  let invalidateStorageStockMock: jest.Mock;
  let insertValuesMock: jest.Mock;
  let insertExecuteMock: jest.Mock;
  let loggerWarnMock: jest.SpyInstance;

  beforeEach(() => {
    findFileRowsMock = jest.fn().mockResolvedValue([]);
    getFileMetadataMock = jest.fn().mockResolvedValue({ size: 42 });
    invalidateStorageStockMock = jest.fn();

    const insertQueryBuilder = {
      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      orIgnore: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue({}),
    };

    insertValuesMock = insertQueryBuilder.values;
    insertExecuteMock = insertQueryBuilder.execute;

    command = new BackfillLogicFunctionFileRowsCommand(
      {} as WorkspaceIteratorService,
      {
        getOrRecompute: jest.fn().mockResolvedValue({
          flatLogicFunctionMaps: {
            byUniversalIdentifier: {
              'logic-function': {
                id: LOGIC_FUNCTION_ID,
                applicationId: APPLICATION.id,
                sourceHandlerPath: `${LOGIC_FUNCTION_ID}/src/index.ts`,
                builtHandlerPath: `${LOGIC_FUNCTION_ID}/src/index.mjs`,
              },
            },
          },
          flatApplicationMaps: {
            byId: { [APPLICATION.id]: APPLICATION },
            idByUniversalIdentifier: {
              [APPLICATION.universalIdentifier]: APPLICATION.id,
            },
          },
        }),
      } as unknown as WorkspaceCacheService,
      {
        getFileMetadata: getFileMetadataMock,
        invalidateStorageStock: invalidateStorageStockMock,
      } as unknown as FileStorageService,
      {
        find: findFileRowsMock,
        createQueryBuilder: jest.fn().mockReturnValue(insertQueryBuilder),
      } as unknown as WorkspaceScopedRepository<FileEntity>,
    );

    loggerWarnMock = jest.spyOn(command['logger'], 'warn').mockImplementation();
    jest.spyOn(command['logger'], 'log').mockImplementation();
  });

  const runOnWorkspace = (dryRun = false) =>
    command.runOnWorkspace({
      workspaceId: WORKSPACE_ID,
      options: { dryRun },
      index: 0,
      total: 1,
    });

  const getInsertedPaths = () =>
    insertValuesMock.mock.calls
      .flatMap(([fileRows]) => fileRows)
      .map(({ path }: { path: string }) => path);

  it('creates the missing file rows of stored logic function files', async () => {
    getFileMetadataMock
      .mockResolvedValueOnce({ size: 120 })
      .mockResolvedValueOnce({ size: 340 });

    await runOnWorkspace();

    expect(getFileMetadataMock).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
      applicationUniversalIdentifier: APPLICATION.universalIdentifier,
      fileFolder: FileFolder.Source,
      resourcePath: `${LOGIC_FUNCTION_ID}/src/index.ts`,
    });
    expect(insertValuesMock).toHaveBeenCalledWith([
      {
        workspaceId: WORKSPACE_ID,
        applicationId: APPLICATION.id,
        path: SOURCE_FILE_PATH,
        size: 120,
        mimeType: 'application/typescript',
        status: 'UPLOADED',
        settings: { isTemporaryFile: false, toDelete: false },
      },
      {
        workspaceId: WORKSPACE_ID,
        applicationId: APPLICATION.id,
        path: BUILT_FILE_PATH,
        size: 340,
        mimeType: 'text/javascript',
        status: 'UPLOADED',
        settings: { isTemporaryFile: false, toDelete: false },
      },
    ]);
    expect(invalidateStorageStockMock).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
      applicationId: APPLICATION.id,
    });
  });

  it('only looks up the file rows of logic function files', async () => {
    await runOnWorkspace();

    expect(findFileRowsMock).toHaveBeenCalledWith(
      WORKSPACE_ID,
      expect.objectContaining({
        where: { path: In([SOURCE_FILE_PATH, BUILT_FILE_PATH]) },
        withDeleted: true,
      }),
    );
  });

  it('only backfills the files that have no file row', async () => {
    findFileRowsMock.mockResolvedValue([
      { applicationId: APPLICATION.id, path: SOURCE_FILE_PATH },
    ]);

    await runOnWorkspace();

    expect(getFileMetadataMock).toHaveBeenCalledTimes(1);
    expect(getInsertedPaths()).toEqual([BUILT_FILE_PATH]);
  });

  it('skips the files missing from storage', async () => {
    getFileMetadataMock
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ size: 340 });

    await runOnWorkspace();

    expect(getInsertedPaths()).toEqual([BUILT_FILE_PATH]);
    expect(loggerWarnMock).toHaveBeenCalledWith(
      expect.stringContaining(
        'Skipping 1 logic function file(s) missing from storage',
      ),
    );
  });

  it('writes nothing in dry run', async () => {
    await runOnWorkspace(true);

    expect(insertValuesMock).not.toHaveBeenCalled();
    expect(invalidateStorageStockMock).not.toHaveBeenCalled();
  });

  it('drops the storage stock counters when an insert fails', async () => {
    insertExecuteMock.mockRejectedValue(new Error('insert failed'));

    await expect(runOnWorkspace()).rejects.toThrow('insert failed');

    expect(invalidateStorageStockMock).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
      applicationId: APPLICATION.id,
    });
  });

  it('drops the storage stock counters when a previous run already inserted every row', async () => {
    findFileRowsMock.mockResolvedValue([
      { applicationId: APPLICATION.id, path: SOURCE_FILE_PATH },
      { applicationId: APPLICATION.id, path: BUILT_FILE_PATH },
    ]);

    await runOnWorkspace();

    expect(getFileMetadataMock).not.toHaveBeenCalled();
    expect(insertValuesMock).not.toHaveBeenCalled();
    expect(invalidateStorageStockMock).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
      applicationId: APPLICATION.id,
    });
  });
});

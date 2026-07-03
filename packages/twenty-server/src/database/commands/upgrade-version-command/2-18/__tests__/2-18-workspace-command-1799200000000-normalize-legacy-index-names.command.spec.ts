import { type DataSource, type QueryRunner } from 'typeorm';

import { NormalizeLegacyIndexNamesCommand } from 'src/database/commands/upgrade-version-command/2-18/2-18-workspace-command-1799200000000-normalize-legacy-index-names.command';
import { doesPhysicalIndexExist } from 'src/database/commands/upgrade-version-command/2-18/utils/does-physical-index-exist.util';
import { getPhysicalIndexDefinition } from 'src/database/commands/upgrade-version-command/2-18/utils/get-physical-index-definition.util';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import { generateFlatIndexMetadataWithNameOrThrow } from 'src/engine/metadata-modules/index-metadata/utils/generate-flat-index.util';
import {
  deleteIndexMetadata,
  dropIndexFromWorkspaceSchema,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/index/utils/index-action-handler.utils';

jest.mock(
  'src/engine/metadata-modules/index-metadata/utils/generate-flat-index.util',
);
jest.mock(
  'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/index/utils/index-action-handler.utils',
);
jest.mock(
  'src/database/commands/upgrade-version-command/2-18/utils/does-physical-index-exist.util',
);
jest.mock(
  'src/database/commands/upgrade-version-command/2-18/utils/get-physical-index-definition.util',
);

const generateFlatIndexMetadataWithNameOrThrowMock =
  generateFlatIndexMetadataWithNameOrThrow as jest.Mock;
const deleteIndexMetadataMock = deleteIndexMetadata as jest.Mock;
const dropIndexFromWorkspaceSchemaMock = dropIndexFromWorkspaceSchema as jest.Mock;
const doesPhysicalIndexExistMock = doesPhysicalIndexExist as jest.Mock;
const getPhysicalIndexDefinitionMock = getPhysicalIndexDefinition as jest.Mock;

const WORKSPACE_ID = '20202020-0000-0000-0000-000000000001';

type IndexFixture = {
  universalIdentifier: string;
  id: string;
  name: string;
  expectedName: string;
};

const buildFlatEntityMaps = (indexes: IndexFixture[]) => {
  const flatIndexMaps = {
    byUniversalIdentifier: Object.fromEntries(
      indexes.map((index) => [
        index.universalIdentifier,
        {
          universalIdentifier: index.universalIdentifier,
          id: index.id,
          name: index.name,
          objectMetadataId: 'object-1',
        },
      ]),
    ),
  };

  const flatObjectMetadataMaps = {
    byUniversalIdentifier: {
      'object-uid': {
        universalIdentifier: 'object-uid',
        nameSingular: 'myObject',
        indexMetadataUniversalIdentifiers: indexes.map(
          (index) => index.universalIdentifier,
        ),
        fieldUniversalIdentifiers: [],
      },
    },
  };

  const flatFieldMetadataMaps = { byUniversalIdentifier: {} };

  // Drive expected names per index via the mocked generator.
  generateFlatIndexMetadataWithNameOrThrowMock.mockImplementation(
    ({ flatIndex }: { flatIndex: { id: string } }) => {
      const match = indexes.find((index) => index.id === flatIndex.id);

      return { name: match?.expectedName ?? flatIndex.id };
    },
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { flatIndexMaps, flatObjectMetadataMaps, flatFieldMetadataMaps } as any;
};

const buildQueryRunner = (): {
  queryRunner: QueryRunner;
  query: jest.Mock;
  commit: jest.Mock;
  rollback: jest.Mock;
} => {
  const query = jest.fn();
  const commit = jest.fn();
  const rollback = jest.fn();

  const queryRunner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: commit,
    rollbackTransaction: rollback,
    release: jest.fn(),
    query,
  } as unknown as QueryRunner;

  return { queryRunner, query, commit, rollback };
};

describe('NormalizeLegacyIndexNamesCommand', () => {
  let command: NormalizeLegacyIndexNamesCommand;
  let renameIndexMock: jest.Mock;
  let dropIndexMock: jest.Mock;
  let getOrRecomputeMock: jest.Mock;
  let invalidateAndRecomputeMock: jest.Mock;

  const setPhysicalIndexes = (physicalIndexNames: string[]) => {
    doesPhysicalIndexExistMock.mockImplementation(
      ({ indexName }: { indexName: string }) =>
        Promise.resolve(physicalIndexNames.includes(indexName)),
    );
  };

  const setPhysicalIndexDefinitions = (
    definitionsByName: Record<string, string>,
  ) => {
    getPhysicalIndexDefinitionMock.mockImplementation(
      ({ indexName }: { indexName: string }) =>
        Promise.resolve(definitionsByName[indexName] ?? null),
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();

    renameIndexMock = jest.fn();
    dropIndexMock = jest.fn();
    getOrRecomputeMock = jest.fn();
    invalidateAndRecomputeMock = jest.fn();

    const workspaceIteratorService = {} as WorkspaceIteratorService;
    const workspaceCacheService = {
      getOrRecompute: getOrRecomputeMock,
      invalidateAndRecompute: invalidateAndRecomputeMock,
    } as unknown as WorkspaceCacheService;
    const workspaceSchemaManagerService = {
      indexManager: {
        renameIndexWithoutRebuild: renameIndexMock,
        dropIndex: dropIndexMock,
      },
    } as unknown as WorkspaceSchemaManagerService;

    command = new NormalizeLegacyIndexNamesCommand(
      workspaceIteratorService,
      workspaceCacheService,
      workspaceSchemaManagerService,
    );
  });

  const runOnWorkspace = (dataSource: DataSource, dryRun = false) =>
    command.runOnWorkspace({
      workspaceId: WORKSPACE_ID,
      dataSource: dataSource as never,
      options: { dryRun },
      index: 0,
      total: 1,
    });

  it('renames a legacy-named index and updates its metadata row, then invalidates the cache', async () => {
    getOrRecomputeMock.mockResolvedValue(
      buildFlatEntityMaps([
        {
          universalIdentifier: 'idx-uid',
          id: 'index-1',
          name: 'legacyhash',
          expectedName: 'IDX_UNIQUE_new',
        },
      ]),
    );

    setPhysicalIndexes(['legacyhash']);

    const { queryRunner, query, commit } = buildQueryRunner();
    const dataSource = {
      createQueryRunner: () => queryRunner,
    } as unknown as DataSource;

    await runOnWorkspace(dataSource);

    expect(renameIndexMock).toHaveBeenCalledWith(
      expect.objectContaining({
        fromIndexName: 'legacyhash',
        toIndexName: 'IDX_UNIQUE_new',
      }),
    );
    expect(query).toHaveBeenCalledWith(expect.stringContaining('UPDATE'), [
      'IDX_UNIQUE_new',
      'index-1',
      WORKSPACE_ID,
    ]);
    expect(dropIndexFromWorkspaceSchemaMock).not.toHaveBeenCalled();
    expect(commit).toHaveBeenCalled();
    expect(invalidateAndRecomputeMock).toHaveBeenCalledWith(WORKSPACE_ID, [
      'flatIndexMaps',
      'flatObjectMetadataMaps',
    ]);
  });

  it('drops the redundant duplicate and renames the survivor when two indexes collide', async () => {
    getOrRecomputeMock.mockResolvedValue(
      buildFlatEntityMaps([
        {
          universalIdentifier: 'idx-a',
          id: 'index-a',
          name: 'legacyA',
          expectedName: 'IDX_UNIQUE_shared',
        },
        {
          universalIdentifier: 'idx-b',
          id: 'index-b',
          name: 'legacyB',
          expectedName: 'IDX_UNIQUE_shared',
        },
      ]),
    );

    setPhysicalIndexes(['legacyA', 'legacyB']);

    const { queryRunner } = buildQueryRunner();
    const dataSource = {
      createQueryRunner: () => queryRunner,
    } as unknown as DataSource;

    await runOnWorkspace(dataSource);

    expect(renameIndexMock).toHaveBeenCalledTimes(1);
    expect(renameIndexMock).toHaveBeenCalledWith(
      expect.objectContaining({
        fromIndexName: 'legacyA',
        toIndexName: 'IDX_UNIQUE_shared',
      }),
    );
    expect(dropIndexFromWorkspaceSchemaMock).toHaveBeenCalledTimes(1);
    expect(dropIndexFromWorkspaceSchemaMock).toHaveBeenCalledWith(
      expect.objectContaining({ indexName: 'legacyB' }),
    );
    expect(deleteIndexMetadataMock).toHaveBeenCalledWith(
      expect.objectContaining({ entityId: 'index-b', workspaceId: WORKSPACE_ID }),
    );
  });

  it('does nothing when all index names already match', async () => {
    getOrRecomputeMock.mockResolvedValue(
      buildFlatEntityMaps([
        {
          universalIdentifier: 'idx-uid',
          id: 'index-1',
          name: 'IDX_ok',
          expectedName: 'IDX_ok',
        },
      ]),
    );

    const createQueryRunner = jest.fn();
    const dataSource = { createQueryRunner } as unknown as DataSource;

    await runOnWorkspace(dataSource);

    expect(createQueryRunner).not.toHaveBeenCalled();
    expect(renameIndexMock).not.toHaveBeenCalled();
    expect(invalidateAndRecomputeMock).not.toHaveBeenCalled();
  });

  it('does not write anything in dry-run mode', async () => {
    getOrRecomputeMock.mockResolvedValue(
      buildFlatEntityMaps([
        {
          universalIdentifier: 'idx-uid',
          id: 'index-1',
          name: 'legacyhash',
          expectedName: 'IDX_UNIQUE_new',
        },
      ]),
    );

    const createQueryRunner = jest.fn();
    const dataSource = { createQueryRunner } as unknown as DataSource;

    await runOnWorkspace(dataSource, true);

    expect(createQueryRunner).not.toHaveBeenCalled();
    expect(renameIndexMock).not.toHaveBeenCalled();
    expect(dropIndexFromWorkspaceSchemaMock).not.toHaveBeenCalled();
    expect(invalidateAndRecomputeMock).not.toHaveBeenCalled();
  });

  it('reconciles metadata without renaming when the physical index already carries the expected name', async () => {
    getOrRecomputeMock.mockResolvedValue(
      buildFlatEntityMaps([
        {
          universalIdentifier: 'idx-uid',
          id: 'index-1',
          name: 'legacyhash',
          expectedName: 'IDX_UNIQUE_new',
        },
      ]),
    );

    // Metadata drift: the physical index was already renamed to the v2 name.
    setPhysicalIndexes(['IDX_UNIQUE_new']);

    const { queryRunner, query, commit } = buildQueryRunner();
    const dataSource = {
      createQueryRunner: () => queryRunner,
    } as unknown as DataSource;

    await runOnWorkspace(dataSource);

    expect(renameIndexMock).not.toHaveBeenCalled();
    expect(query).toHaveBeenCalledWith(expect.stringContaining('UPDATE'), [
      'IDX_UNIQUE_new',
      'index-1',
      WORKSPACE_ID,
    ]);
    expect(commit).toHaveBeenCalled();
    expect(invalidateAndRecomputeMock).toHaveBeenCalledWith(WORKSPACE_ID, [
      'flatIndexMaps',
      'flatObjectMetadataMaps',
    ]);
  });

  it('skips the physical rename but still reconciles metadata when neither source nor target index exists', async () => {
    getOrRecomputeMock.mockResolvedValue(
      buildFlatEntityMaps([
        {
          universalIdentifier: 'idx-uid',
          id: 'index-1',
          name: 'legacyhash',
          expectedName: 'IDX_UNIQUE_new',
        },
      ]),
    );

    setPhysicalIndexes([]);

    const { queryRunner, query, commit } = buildQueryRunner();
    const dataSource = {
      createQueryRunner: () => queryRunner,
    } as unknown as DataSource;

    await runOnWorkspace(dataSource);

    expect(renameIndexMock).not.toHaveBeenCalled();
    expect(query).toHaveBeenCalledWith(expect.stringContaining('UPDATE'), [
      'IDX_UNIQUE_new',
      'index-1',
      WORKSPACE_ID,
    ]);
    expect(commit).toHaveBeenCalled();
    expect(invalidateAndRecomputeMock).toHaveBeenCalledWith(WORKSPACE_ID, [
      'flatIndexMaps',
      'flatObjectMetadataMaps',
    ]);
  });

  it('drops the duplicate legacy index when both source and target exist with the same definition', async () => {
    getOrRecomputeMock.mockResolvedValue(
      buildFlatEntityMaps([
        {
          universalIdentifier: 'idx-uid',
          id: 'index-1',
          name: 'legacyhash',
          expectedName: 'IDX_UNIQUE_new',
        },
      ]),
    );

    setPhysicalIndexes(['legacyhash', 'IDX_UNIQUE_new']);
    setPhysicalIndexDefinitions({
      legacyhash:
        'CREATE UNIQUE INDEX legacyhash ON workspace_test."myObject" USING btree (name)',
      IDX_UNIQUE_new:
        'CREATE UNIQUE INDEX "IDX_UNIQUE_new" ON workspace_test."myObject" USING btree (name)',
    });

    const { queryRunner, query, commit } = buildQueryRunner();
    const dataSource = {
      createQueryRunner: () => queryRunner,
    } as unknown as DataSource;

    await runOnWorkspace(dataSource);

    expect(renameIndexMock).not.toHaveBeenCalled();
    expect(dropIndexMock).toHaveBeenCalledWith(
      expect.objectContaining({ indexName: 'legacyhash' }),
    );
    expect(query).toHaveBeenCalledWith(expect.stringContaining('UPDATE'), [
      'IDX_UNIQUE_new',
      'index-1',
      WORKSPACE_ID,
    ]);
    expect(commit).toHaveBeenCalled();
    expect(invalidateAndRecomputeMock).toHaveBeenCalledWith(WORKSPACE_ID, [
      'flatIndexMaps',
      'flatObjectMetadataMaps',
    ]);
  });

  it('leaves the orphan source index in place when both exist but with different definitions', async () => {
    getOrRecomputeMock.mockResolvedValue(
      buildFlatEntityMaps([
        {
          universalIdentifier: 'idx-uid',
          id: 'index-1',
          name: 'legacyhash',
          expectedName: 'IDX_UNIQUE_new',
        },
      ]),
    );

    setPhysicalIndexes(['legacyhash', 'IDX_UNIQUE_new']);
    setPhysicalIndexDefinitions({
      legacyhash:
        'CREATE INDEX legacyhash ON workspace_test."myObject" USING btree ("createdAt")',
      IDX_UNIQUE_new:
        'CREATE UNIQUE INDEX "IDX_UNIQUE_new" ON workspace_test."myObject" USING btree (name)',
    });

    const { queryRunner, query, commit } = buildQueryRunner();
    const dataSource = {
      createQueryRunner: () => queryRunner,
    } as unknown as DataSource;

    await runOnWorkspace(dataSource);

    expect(renameIndexMock).not.toHaveBeenCalled();
    expect(dropIndexMock).not.toHaveBeenCalled();
    expect(dropIndexFromWorkspaceSchemaMock).not.toHaveBeenCalled();
    expect(query).toHaveBeenCalledWith(expect.stringContaining('UPDATE'), [
      'IDX_UNIQUE_new',
      'index-1',
      WORKSPACE_ID,
    ]);
    expect(commit).toHaveBeenCalled();
    expect(invalidateAndRecomputeMock).toHaveBeenCalledWith(WORKSPACE_ID, [
      'flatIndexMaps',
      'flatObjectMetadataMaps',
    ]);
  });

  it('rolls back to the savepoint and continues with remaining operations when one fails', async () => {
    getOrRecomputeMock.mockResolvedValue(
      buildFlatEntityMaps([
        {
          universalIdentifier: 'idx-a',
          id: 'index-a',
          name: 'legacyA',
          expectedName: 'IDX_UNIQUE_newA',
        },
        {
          universalIdentifier: 'idx-b',
          id: 'index-b',
          name: 'legacyB',
          expectedName: 'IDX_UNIQUE_newB',
        },
      ]),
    );

    setPhysicalIndexes(['legacyA', 'legacyB']);

    renameIndexMock.mockRejectedValueOnce(new Error('boom'));

    const { queryRunner, query, commit, rollback } = buildQueryRunner();
    const dataSource = {
      createQueryRunner: () => queryRunner,
    } as unknown as DataSource;

    await runOnWorkspace(dataSource);

    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('ROLLBACK TO SAVEPOINT'),
    );
    // The failed operation's metadata update is rolled back with its savepoint.
    expect(query).not.toHaveBeenCalledWith(expect.stringContaining('UPDATE'), [
      'IDX_UNIQUE_newA',
      'index-a',
      WORKSPACE_ID,
    ]);
    expect(renameIndexMock).toHaveBeenCalledTimes(2);
    expect(query).toHaveBeenCalledWith(expect.stringContaining('UPDATE'), [
      'IDX_UNIQUE_newB',
      'index-b',
      WORKSPACE_ID,
    ]);
    expect(rollback).not.toHaveBeenCalled();
    expect(commit).toHaveBeenCalled();
    expect(invalidateAndRecomputeMock).toHaveBeenCalledWith(WORKSPACE_ID, [
      'flatIndexMaps',
      'flatObjectMetadataMaps',
    ]);
  });

  it('rolls back the whole transaction when savepoint recovery itself fails', async () => {
    getOrRecomputeMock.mockResolvedValue(
      buildFlatEntityMaps([
        {
          universalIdentifier: 'idx-uid',
          id: 'index-1',
          name: 'legacyhash',
          expectedName: 'IDX_UNIQUE_new',
        },
      ]),
    );

    setPhysicalIndexes(['legacyhash']);

    renameIndexMock.mockRejectedValueOnce(new Error('boom'));

    const { queryRunner, query, commit, rollback } = buildQueryRunner();

    query.mockImplementation((sql: string) =>
      sql.startsWith('ROLLBACK TO SAVEPOINT')
        ? Promise.reject(new Error('savepoint recovery failed'))
        : Promise.resolve(),
    );

    const dataSource = {
      createQueryRunner: () => queryRunner,
    } as unknown as DataSource;

    await expect(runOnWorkspace(dataSource)).rejects.toThrow(
      'savepoint recovery failed',
    );

    expect(rollback).toHaveBeenCalled();
    expect(commit).not.toHaveBeenCalled();
    expect(invalidateAndRecomputeMock).not.toHaveBeenCalled();
  });
});

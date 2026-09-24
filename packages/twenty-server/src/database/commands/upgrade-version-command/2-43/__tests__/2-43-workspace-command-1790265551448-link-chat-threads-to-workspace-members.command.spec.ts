import { type DataSource } from 'typeorm';

import { type AgentHistorySchemaService } from 'src/database/commands/agent-history/agent-history-schema.service';
import { type WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { LinkChatThreadsToWorkspaceMembersCommand } from 'src/database/commands/upgrade-version-command/2-43/2-43-workspace-command-1790265551448-link-chat-threads-to-workspace-members.command';
import { type AgentHistoryStorageService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-history-storage.service';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const WORKSPACE_ID = '00000000-0000-4000-8000-000000000001';
const LEGACY_FIELD_UNIVERSAL_IDENTIFIER =
  'bf830886-b6dc-46e9-a229-eecbb0e66032';
const LEGACY_INDEX_UNIVERSAL_IDENTIFIER =
  'c97a4c97-266b-490a-a4d6-76274f5de429';

const buildCommand = ({
  hasLegacyField = true,
  isEmptyUnprovisionedWorkspace = false,
  migrationStatus = 'success',
}: {
  hasLegacyField?: boolean;
  isEmptyUnprovisionedWorkspace?: boolean;
  migrationStatus?: 'success' | 'fail';
} = {}) => {
  const calls: string[] = [];
  const legacyField = {
    universalIdentifier: LEGACY_FIELD_UNIVERSAL_IDENTIFIER,
  };
  const legacyIndex = {
    universalIdentifier: LEGACY_INDEX_UNIVERSAL_IDENTIFIER,
  };
  const lockRunner = {
    isTransactionActive: false,
    connect: jest.fn(),
    startTransaction: jest.fn(() => {
      lockRunner.isTransactionActive = true;
    }),
    query: jest.fn(async () => {
      calls.push('lock');
    }),
    commitTransaction: jest.fn(async () => {
      calls.push('commit');
      lockRunner.isTransactionActive = false;
    }),
    rollbackTransaction: jest.fn(async () => {
      calls.push('rollback');
      lockRunner.isTransactionActive = false;
    }),
    release: jest.fn(),
  };
  const dataSource = {
    createQueryRunner: jest.fn(() => lockRunner),
    query: jest.fn(async (sql: string) => {
      if (sql.startsWith('UPDATE')) {
        calls.push('backfill');
        return [];
      }
      calls.push('delete-orphans');
      return [{ id: 'orphan' }];
    }),
  };
  const prepare = jest.fn(async () => {
    calls.push('prepare');
  });
  const validateBuildAndRunLegacyWorkspaceMigration = jest.fn(async () => {
    calls.push('drop-legacy-field');
    return { status: migrationStatus };
  });
  const command = new LinkChatThreadsToWorkspaceMembersCommand(
    {} as WorkspaceIteratorService,
    { prepare } as unknown as AgentHistorySchemaService,
    {
      isEmptyUnprovisionedWorkspace: jest
        .fn()
        .mockResolvedValue(isEmptyUnprovisionedWorkspace),
    } as unknown as AgentHistoryStorageService,
    {
      getOrRecompute: jest.fn().mockResolvedValue({
        flatFieldMetadataMaps: {
          byUniversalIdentifier: hasLegacyField
            ? { [LEGACY_FIELD_UNIVERSAL_IDENTIFIER]: legacyField }
            : {},
        },
        flatIndexMaps: {
          byUniversalIdentifier: {
            [LEGACY_INDEX_UNIVERSAL_IDENTIFIER]: legacyIndex,
          },
        },
      }),
    } as unknown as WorkspaceCacheService,
    {
      validateBuildAndRunLegacyWorkspaceMigration,
    } as unknown as WorkspaceMigrationValidateBuildAndRunService,
    dataSource as unknown as DataSource,
  );

  return {
    calls,
    command,
    legacyField,
    legacyIndex,
    lockRunner,
    prepare,
    validateBuildAndRunLegacyWorkspaceMigration,
  };
};

const run = (
  command: LinkChatThreadsToWorkspaceMembersCommand,
  options: { dryRun?: boolean } = {},
) =>
  command.runOnWorkspace({
    workspaceId: WORKSPACE_ID,
    options,
    index: 0,
    total: 1,
  });

describe('LinkChatThreadsToWorkspaceMembersCommand', () => {
  it('backfills members and drops the legacy column while chat history is locked', async () => {
    const {
      calls,
      command,
      legacyField,
      legacyIndex,
      validateBuildAndRunLegacyWorkspaceMigration,
    } = buildCommand();

    await run(command);

    expect(calls).toEqual([
      'prepare',
      'lock',
      'lock',
      'backfill',
      'delete-orphans',
      'drop-legacy-field',
      'commit',
    ]);
    expect(validateBuildAndRunLegacyWorkspaceMigration).toHaveBeenCalledWith(
      expect.objectContaining({
        workspaceId: WORKSPACE_ID,
        allFlatEntityOperationByMetadataName: {
          index: {
            flatEntityToCreate: [],
            flatEntityToDelete: [legacyIndex],
            flatEntityToUpdate: [],
          },
          fieldMetadata: {
            flatEntityToCreate: [],
            flatEntityToDelete: [legacyField],
            flatEntityToUpdate: [],
          },
        },
      }),
    );
  });

  it('only provisions the relation when the legacy column is already gone', async () => {
    const { calls, command } = buildCommand({ hasLegacyField: false });

    await run(command);

    expect(calls).toEqual(['prepare']);
  });

  it('does not touch data on a dry run', async () => {
    const { calls, command, prepare } = buildCommand();

    await run(command, { dryRun: true });

    expect(prepare).toHaveBeenCalledWith(WORKSPACE_ID, true);
    expect(calls).toEqual(['prepare']);
  });

  it('skips workspaces without history', async () => {
    const { calls, command } = buildCommand({
      isEmptyUnprovisionedWorkspace: true,
    });

    await run(command);

    expect(calls).toEqual([]);
  });

  it('releases the lock without committing when dropping the column fails', async () => {
    const { calls, command, lockRunner } = buildCommand({
      migrationStatus: 'fail',
    });

    await expect(run(command)).rejects.toThrow(
      'Could not drop the chat thread userWorkspaceId field',
    );
    expect(calls[calls.length - 1]).toBe('rollback');
    expect(lockRunner.release).toHaveBeenCalled();
  });
});

import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { type DataSource } from 'typeorm';

import { type AgentHistorySchemaService } from 'src/database/commands/agent-history/agent-history-schema.service';
import { type WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { LinkChatThreadsToWorkspaceMembersCommand } from 'src/database/commands/upgrade-version-command/2-43/2-43-workspace-command-1790314765778-link-chat-threads-to-workspace-members.command';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { type WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const WORKSPACE_ID = '20202020-1111-4111-8111-111111111111';
const LEGACY_FIELD_IDENTIFIER = 'bf830886-b6dc-46e9-a229-eecbb0e66032';

const buildMetadata = ({
  hasAgentChatThread = true,
  isLegacyFieldNullable = false,
  hasLegacyField = true,
}: {
  hasAgentChatThread?: boolean;
  isLegacyFieldNullable?: boolean;
  hasLegacyField?: boolean;
}) => {
  const metadata = structuredClone(
    computeTwentyStandardApplicationAllFlatEntityMaps({
      now: '2026-01-01T00:00:00Z',
      workspaceId: WORKSPACE_ID,
      twentyStandardApplicationId: '20202020-2222-4222-8222-222222222222',
    }).allFlatEntityMaps,
  );
  const fields = metadata.flatFieldMetadataMaps.byUniversalIdentifier;

  if (!hasAgentChatThread) {
    delete metadata.flatObjectMetadataMaps.byUniversalIdentifier[
      STANDARD_OBJECTS.agentChatThread.universalIdentifier
    ];
  }
  if (hasLegacyField) {
    fields[LEGACY_FIELD_IDENTIFIER] = {
      ...fields[LEGACY_FIELD_IDENTIFIER]!,
      isNullable: isLegacyFieldNullable,
    };
  } else {
    delete fields[LEGACY_FIELD_IDENTIFIER];
  }

  return metadata;
};

const buildCommand = (
  metadataOptions: Parameters<typeof buildMetadata>[0] = {},
  migrationStatus: 'success' | 'fail' = 'success',
) => {
  const metadata = buildMetadata(metadataOptions);
  const prepare = jest.fn().mockResolvedValue(undefined);
  const validateBuildAndRunLegacyWorkspaceMigration = jest
    .fn()
    .mockResolvedValue({ status: migrationStatus });
  const query = jest.fn().mockResolvedValue([{ id: 'thread-1' }]);

  const command = new LinkChatThreadsToWorkspaceMembersCommand(
    {} as WorkspaceIteratorService,
    { prepare } as unknown as AgentHistorySchemaService,
    {
      getOrRecompute: jest.fn().mockResolvedValue(metadata),
    } as unknown as WorkspaceCacheService,
    {
      validateBuildAndRunLegacyWorkspaceMigration,
    } as unknown as WorkspaceMigrationValidateBuildAndRunService,
    { query } as unknown as DataSource,
  );

  return {
    command,
    prepare,
    validateBuildAndRunLegacyWorkspaceMigration,
    query,
  };
};

const run = (
  command: LinkChatThreadsToWorkspaceMembersCommand,
  dryRun = false,
) =>
  command.runOnWorkspace({
    workspaceId: WORKSPACE_ID,
    options: { dryRun },
  } as RunOnWorkspaceArgs);

describe('LinkChatThreadsToWorkspaceMembersCommand', () => {
  it('makes the legacy owner optional, then backfills members', async () => {
    const {
      command,
      prepare,
      validateBuildAndRunLegacyWorkspaceMigration,
      query,
    } = buildCommand();

    await run(command);

    expect(prepare).toHaveBeenCalledWith(WORKSPACE_ID, false);
    expect(validateBuildAndRunLegacyWorkspaceMigration).toHaveBeenCalledWith(
      expect.objectContaining({
        allFlatEntityOperationByMetadataName: {
          fieldMetadata: {
            flatEntityToCreate: [],
            flatEntityToDelete: [],
            flatEntityToUpdate: [
              expect.objectContaining({
                universalIdentifier: LEGACY_FIELD_IDENTIFIER,
                isNullable: true,
              }),
            ],
          },
        },
      }),
    );
    expect(query).toHaveBeenCalledTimes(1);
    expect(query.mock.calls[0][0]).toContain('SET "workspaceMemberId"');
    expect(query.mock.calls[0][0]).toContain('"workspaceMemberId" IS NULL');
    expect(query.mock.calls[0][1]).toEqual([WORKSPACE_ID]);
    expect(
      validateBuildAndRunLegacyWorkspaceMigration.mock.invocationCallOrder[0],
    ).toBeLessThan(query.mock.invocationCallOrder[0]);
  });

  it('only backfills on a rerun', async () => {
    const { command, validateBuildAndRunLegacyWorkspaceMigration, query } =
      buildCommand({ isLegacyFieldNullable: true });

    await run(command);

    expect(validateBuildAndRunLegacyWorkspaceMigration).not.toHaveBeenCalled();
    expect(query).toHaveBeenCalledTimes(1);
  });

  it('does nothing more when the legacy owner is already gone', async () => {
    const { command, validateBuildAndRunLegacyWorkspaceMigration, query } =
      buildCommand({ hasLegacyField: false });

    await run(command);

    expect(validateBuildAndRunLegacyWorkspaceMigration).not.toHaveBeenCalled();
    expect(query).not.toHaveBeenCalled();
  });

  it('skips workspaces without chat history objects', async () => {
    const { command, prepare, query } = buildCommand({
      hasAgentChatThread: false,
    });

    await run(command);

    expect(prepare).not.toHaveBeenCalled();
    expect(query).not.toHaveBeenCalled();
  });

  it('writes nothing on a dry run', async () => {
    const {
      command,
      prepare,
      validateBuildAndRunLegacyWorkspaceMigration,
      query,
    } = buildCommand();

    await run(command, true);

    expect(prepare).toHaveBeenCalledWith(WORKSPACE_ID, true);
    expect(validateBuildAndRunLegacyWorkspaceMigration).not.toHaveBeenCalled();
    expect(query).not.toHaveBeenCalled();
  });

  it('stops before backfilling when the metadata update fails', async () => {
    const { command, query } = buildCommand({}, 'fail');

    await expect(run(command)).rejects.toThrow(
      'Could not make chat thread userWorkspaceId optional',
    );
    expect(query).not.toHaveBeenCalled();
  });
});

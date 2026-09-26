import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { type DataSource } from 'typeorm';

import { type WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { LinkChatThreadsToWorkspaceMembersCommand } from 'src/database/commands/upgrade-version-command/2-43/2-43-workspace-command-1790360612188-link-chat-threads-to-workspace-members.command';
import { type ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const WORKSPACE_ID = '20202020-1111-4111-8111-111111111111';

const buildCommand = ({ hasAgentChatThread = true } = {}) => {
  const runMigration = jest.fn();
  const query = jest.fn();
  const emptyMaps = { byUniversalIdentifier: {} };

  const command = new LinkChatThreadsToWorkspaceMembersCommand(
    {} as WorkspaceIteratorService,
    {
      findWorkspaceTwentyStandardAndCustomApplicationOrThrow: jest
        .fn()
        .mockResolvedValue({
          twentyStandardFlatApplication: {
            id: '20202020-2222-4222-8222-222222222222',
            universalIdentifier: 'twenty-standard',
          },
        }),
    } as unknown as ApplicationService,
    {
      getOrRecompute: jest.fn().mockResolvedValue({
        flatObjectMetadataMaps: {
          byUniversalIdentifier: hasAgentChatThread
            ? {
                [STANDARD_OBJECTS.agentChatThread.universalIdentifier]: {
                  id: 'agent-chat-thread',
                },
              }
            : {},
        },
        flatFieldMetadataMaps: emptyMaps,
        flatIndexMaps: emptyMaps,
      }),
    } as unknown as WorkspaceCacheService,
    {
      validateBuildAndRunLegacyWorkspaceMigration: runMigration,
    } as unknown as WorkspaceMigrationValidateBuildAndRunService,
    { query } as unknown as DataSource,
  );

  return { command, runMigration, query };
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
  it('skips workspaces without chat history objects', async () => {
    const { command, runMigration, query } = buildCommand({
      hasAgentChatThread: false,
    });

    await run(command);

    expect(runMigration).not.toHaveBeenCalled();
    expect(query).not.toHaveBeenCalled();
  });

  it('writes nothing on a dry run', async () => {
    const { command, runMigration, query } = buildCommand();

    await run(command, true);

    expect(runMigration).not.toHaveBeenCalled();
    expect(query).not.toHaveBeenCalled();
  });
});

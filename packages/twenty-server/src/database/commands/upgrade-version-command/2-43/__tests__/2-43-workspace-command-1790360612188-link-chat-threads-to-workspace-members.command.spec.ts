import { getDataSourceToken } from '@nestjs/typeorm';
import { Test } from '@nestjs/testing';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { LinkChatThreadsToWorkspaceMembersCommand } from 'src/database/commands/upgrade-version-command/2-43/2-43-workspace-command-1790360612188-link-chat-threads-to-workspace-members.command';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const WORKSPACE_ID = '20202020-1111-4111-8111-111111111111';

const buildCommand = async ({ hasAgentChatThread = true } = {}) => {
  const runMigration = jest.fn();
  const query = jest.fn();
  const emptyMaps = { byUniversalIdentifier: {} };

  const module = await Test.createTestingModule({
    providers: [
      LinkChatThreadsToWorkspaceMembersCommand,
      { provide: WorkspaceIteratorService, useValue: {} },
      {
        provide: ApplicationService,
        useValue: {
          findWorkspaceTwentyStandardAndCustomApplicationOrThrow: jest
            .fn()
            .mockResolvedValue({
              twentyStandardFlatApplication: {
                id: '20202020-2222-4222-8222-222222222222',
                universalIdentifier: 'twenty-standard',
              },
            }),
        },
      },
      {
        provide: WorkspaceCacheService,
        useValue: {
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
        },
      },
      {
        provide: WorkspaceMigrationValidateBuildAndRunService,
        useValue: {
          validateBuildAndRunLegacyWorkspaceMigration: runMigration,
        },
      },
      { provide: getDataSourceToken(), useValue: { query } },
    ],
  }).compile();
  const command = module.get(LinkChatThreadsToWorkspaceMembersCommand);

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
    const { command, runMigration, query } = await buildCommand({
      hasAgentChatThread: false,
    });

    await run(command);

    expect(runMigration).not.toHaveBeenCalled();
    expect(query).not.toHaveBeenCalled();
  });

  it('writes nothing on a dry run', async () => {
    const { command, runMigration, query } = await buildCommand();

    await run(command, true);

    expect(runMigration).not.toHaveBeenCalled();
    expect(query).not.toHaveBeenCalled();
  });
});

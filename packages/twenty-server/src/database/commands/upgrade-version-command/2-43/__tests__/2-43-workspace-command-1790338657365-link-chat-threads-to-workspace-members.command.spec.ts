import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { type DataSource } from 'typeorm';

import { type AgentHistorySchemaService } from 'src/database/commands/agent-history/agent-history-schema.service';
import { type WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { LinkChatThreadsToWorkspaceMembersCommand } from 'src/database/commands/upgrade-version-command/2-43/2-43-workspace-command-1790338657365-link-chat-threads-to-workspace-members.command';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const WORKSPACE_ID = '20202020-1111-4111-8111-111111111111';

const buildCommand = ({ hasAgentChatThread = true } = {}) => {
  const prepare = jest.fn().mockResolvedValue(undefined);
  const query = jest.fn().mockResolvedValue([{ id: 'thread-1' }]);

  const command = new LinkChatThreadsToWorkspaceMembersCommand(
    {} as WorkspaceIteratorService,
    { prepare } as unknown as AgentHistorySchemaService,
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
      }),
    } as unknown as WorkspaceCacheService,
    { query } as unknown as DataSource,
  );

  return { command, prepare, query };
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
  it('provisions the owner relation, then backfills members', async () => {
    const { command, prepare, query } = buildCommand();

    await run(command);

    expect(prepare).toHaveBeenCalledWith(WORKSPACE_ID, false);
    expect(query).toHaveBeenCalledTimes(1);
    expect(query.mock.calls[0][0]).toContain('SET "workspaceMemberId"');
    expect(query.mock.calls[0][0]).toContain('"workspaceMemberId" IS NULL');
    expect(query.mock.calls[0][1]).toEqual([WORKSPACE_ID]);
    expect(prepare.mock.invocationCallOrder[0]).toBeLessThan(
      query.mock.invocationCallOrder[0],
    );
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
    const { command, prepare, query } = buildCommand();

    await run(command, true);

    expect(prepare).toHaveBeenCalledWith(WORKSPACE_ID, true);
    expect(query).not.toHaveBeenCalled();
  });
});

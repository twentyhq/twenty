import { type WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { BackfillMessageCalendarTargetsCommand } from 'src/database/commands/upgrade-version-command/2-37/2-37-workspace-command-1787832413051-backfill-message-calendar-targets.command';

const WORKSPACE_ID = '20202020-0000-0000-0000-000000000001';

describe('BackfillMessageCalendarTargetsCommand', () => {
  it('skips workspaces without a data source', async () => {
    const command = new BackfillMessageCalendarTargetsCommand(
      {} as WorkspaceIteratorService,
    );

    jest.spyOn(command['logger'], 'warn').mockImplementation();

    await expect(
      command.runOnWorkspace({
        workspaceId: WORKSPACE_ID,
        options: {},
        dataSource: undefined,
        index: 0,
        total: 1,
      }),
    ).resolves.toBeUndefined();
    expect(command['logger'].warn).toHaveBeenCalledWith(
      `Skipping message and calendar target backfill for workspace ${WORKSPACE_ID}: no workspace data source`,
    );
  });

  it('continues a full candidate batch when conflicts reduce inserted rows', async () => {
    const query = jest
      .fn()
      .mockResolvedValueOnce([
        {
          calendarEventTarget: 'workspace.calendarEventTarget',
          messageThreadTarget: 'workspace.messageThreadTarget',
        },
      ])
      .mockResolvedValueOnce([{ candidateCount: 5_000, insertedCount: 4_999 }])
      .mockResolvedValueOnce([{ candidateCount: 1, insertedCount: 1 }])
      .mockResolvedValue([{ candidateCount: 0, insertedCount: 0 }]);
    const command = new BackfillMessageCalendarTargetsCommand(
      {} as WorkspaceIteratorService,
    );

    jest.spyOn(command['logger'], 'log').mockImplementation();

    await command.runOnWorkspace({
      workspaceId: WORKSPACE_ID,
      options: {},
      dataSource: { query } as never,
      index: 0,
      total: 1,
    });

    expect(query).toHaveBeenCalledTimes(8);
    expect(command['logger'].log).toHaveBeenCalledWith(
      `Created 5000 calendar event person targets for workspace ${WORKSPACE_ID}`,
    );
  });

  it('skips workspaces whose target tables were not provisioned', async () => {
    const query = jest.fn().mockResolvedValue([
      {
        calendarEventTarget: null,
        messageThreadTarget: null,
      },
    ]);
    const command = new BackfillMessageCalendarTargetsCommand(
      {} as WorkspaceIteratorService,
    );

    jest.spyOn(command['logger'], 'warn').mockImplementation();

    await command.runOnWorkspace({
      workspaceId: WORKSPACE_ID,
      options: {},
      dataSource: { query } as never,
      index: 0,
      total: 1,
    });

    expect(query).toHaveBeenCalledTimes(1);
    expect(command['logger'].warn).toHaveBeenCalledWith(
      `Skipping message and calendar target backfill for workspace ${WORKSPACE_ID}: target tables are not provisioned`,
    );
  });
});

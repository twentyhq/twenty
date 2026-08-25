import { type WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { BackfillMessageCalendarTargetsCommand } from 'src/database/commands/upgrade-version-command/2-35/2-35-workspace-command-1787688001000-backfill-message-calendar-targets.command';

const WORKSPACE_ID = '20202020-0000-0000-0000-000000000001';

describe('BackfillMessageCalendarTargetsCommand', () => {
  it('continues a full candidate batch when conflicts reduce inserted rows', async () => {
    const query = jest
      .fn()
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

    expect(query).toHaveBeenCalledTimes(7);
    expect(command['logger'].log).toHaveBeenCalledWith(
      `Created 5000 calendar event person targets for workspace ${WORKSPACE_ID}`,
    );
  });
});

import { STANDARD_TIMELINE_ACTIVITY_RENDERER_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/timeline';

import { type WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { ConfigureStandardTimelineRenderersCommand } from 'src/database/commands/upgrade-version-command/2-34/2-34-workspace-command-1787425000000-configure-standard-timeline-renderers.command';

const WORKSPACE_ID = '00000000-0000-4000-8000-000000000001';

describe('ConfigureStandardTimelineRenderersCommand', () => {
  it('attaches trusted renderer identifiers to their standard types', async () => {
    const query = jest.fn().mockResolvedValue([[], 0]);
    const command = new ConfigureStandardTimelineRenderersCommand(
      {} as WorkspaceIteratorService,
    );

    await command.runOnWorkspace({
      workspaceId: WORKSPACE_ID,
      dataSource: { query } as never,
      options: {},
      index: 0,
      total: 1,
    });

    expect(query).toHaveBeenCalledTimes(1);
    expect(query.mock.calls[0][0]).toContain(
      '"frontComponentUniversalIdentifier"',
    );
    expect(query.mock.calls[0][1]).toEqual(
      expect.arrayContaining([
        WORKSPACE_ID,
        STANDARD_TIMELINE_ACTIVITY_RENDERER_UNIVERSAL_IDENTIFIERS.message,
        STANDARD_TIMELINE_ACTIVITY_RENDERER_UNIVERSAL_IDENTIFIERS.calendarEvent,
      ]),
    );
  });
});

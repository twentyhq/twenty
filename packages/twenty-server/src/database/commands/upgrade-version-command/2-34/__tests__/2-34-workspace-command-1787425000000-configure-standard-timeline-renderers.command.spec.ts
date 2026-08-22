import { STANDARD_TIMELINE_ACTIVITY_RENDERER_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/timeline';

import { type WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { ConfigureStandardTimelineRenderersCommand } from 'src/database/commands/upgrade-version-command/2-34/2-34-workspace-command-1787425000000-configure-standard-timeline-renderers.command';
import { type ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const WORKSPACE_ID = '00000000-0000-4000-8000-000000000001';
const STANDARD_APPLICATION_ID = '00000000-0000-4000-8000-000000000002';

describe('ConfigureStandardTimelineRenderersCommand', () => {
  it('attaches trusted renderer identifiers to their standard types', async () => {
    const query = jest.fn().mockResolvedValue([[], 2]);
    const invalidateAndRecompute = jest.fn().mockResolvedValue(undefined);
    const command = new ConfigureStandardTimelineRenderersCommand(
      {} as WorkspaceIteratorService,
      {
        findWorkspaceTwentyStandardAndCustomApplicationOrThrow: jest
          .fn()
          .mockResolvedValue({
            twentyStandardFlatApplication: { id: STANDARD_APPLICATION_ID },
          }),
      } as unknown as ApplicationService,
      { invalidateAndRecompute } as unknown as WorkspaceCacheService,
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
    expect(query.mock.calls[0][0]).toContain(
      'timeline_activity_type."applicationId" = $2',
    );
    expect(query.mock.calls[0][1]).toEqual(
      expect.arrayContaining([
        WORKSPACE_ID,
        STANDARD_APPLICATION_ID,
        STANDARD_TIMELINE_ACTIVITY_RENDERER_UNIVERSAL_IDENTIFIERS.message,
        STANDARD_TIMELINE_ACTIVITY_RENDERER_UNIVERSAL_IDENTIFIERS.calendarEvent,
      ]),
    );
    expect(invalidateAndRecompute).toHaveBeenCalledWith(WORKSPACE_ID, [
      'flatTimelineActivityTypeMaps',
    ]);
  });

  it('fails after refreshing the cache when a standard renderer is missing', async () => {
    const invalidateAndRecompute = jest.fn().mockResolvedValue(undefined);
    const command = new ConfigureStandardTimelineRenderersCommand(
      {} as WorkspaceIteratorService,
      {
        findWorkspaceTwentyStandardAndCustomApplicationOrThrow: jest
          .fn()
          .mockResolvedValue({
            twentyStandardFlatApplication: { id: STANDARD_APPLICATION_ID },
          }),
      } as unknown as ApplicationService,
      { invalidateAndRecompute } as unknown as WorkspaceCacheService,
    );

    await expect(
      command.runOnWorkspace({
        workspaceId: WORKSPACE_ID,
        dataSource: { query: jest.fn().mockResolvedValue([[], 1]) } as never,
        options: {},
        index: 0,
        total: 1,
      }),
    ).rejects.toThrow('updated 1');
    expect(invalidateAndRecompute).toHaveBeenCalledTimes(1);
  });
});

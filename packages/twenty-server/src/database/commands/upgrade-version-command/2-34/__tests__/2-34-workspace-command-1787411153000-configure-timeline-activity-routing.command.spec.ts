import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { type WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { ConfigureTimelineActivityRoutingCommand } from 'src/database/commands/upgrade-version-command/2-34/2-34-workspace-command-1787411153000-configure-timeline-activity-routing.command';
import { type ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const WORKSPACE_ID = '00000000-0000-4000-8000-000000000001';
const STANDARD_APPLICATION_ID = '00000000-0000-4000-8000-000000000002';

describe('ConfigureTimelineActivityRoutingCommand', () => {
  it('backfills standard types and participant junctions into the generic contract', async () => {
    const query = jest.fn().mockResolvedValue([[], 0]);
    const invalidateAndRecompute = jest.fn().mockResolvedValue(undefined);
    const command = new ConfigureTimelineActivityRoutingCommand(
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

    expect(query).toHaveBeenCalledTimes(2);
    expect(query.mock.calls[0][0]).toContain(
      '"targetRelationFieldUniversalIdentifier"',
    );
    expect(query.mock.calls[0][0]).toContain(
      '"triggerFieldUniversalIdentifiers"',
    );
    expect(query.mock.calls[0][0]).toContain(
      'timeline_activity_type."applicationId" = $2',
    );
    expect(query.mock.calls[0][1]).toEqual(
      expect.arrayContaining([
        WORKSPACE_ID,
        STANDARD_APPLICATION_ID,
        STANDARD_OBJECTS.note.fields.noteTargets.universalIdentifier,
        STANDARD_OBJECTS.message.fields.messageParticipants
          .universalIdentifier,
        STANDARD_OBJECTS.calendarEvent.fields.calendarEventParticipants
          .universalIdentifier,
      ]),
    );
    expect(query.mock.calls[0][1]).toContainEqual([
      STANDARD_OBJECTS.note.fields.title.universalIdentifier,
    ]);
    expect(query.mock.calls[1][0]).toContain('junctionTargetFieldId');
    expect(query.mock.calls[1][1]).toEqual(
      expect.arrayContaining([
        STANDARD_OBJECTS.messageParticipant.fields.person.universalIdentifier,
        STANDARD_OBJECTS.calendarEventParticipant.fields.person
          .universalIdentifier,
      ]),
    );
    expect(invalidateAndRecompute).toHaveBeenCalledWith(WORKSPACE_ID, [
      'flatTimelineActivityTypeMaps',
      'flatFieldMetadataMaps',
    ]);
  });
});

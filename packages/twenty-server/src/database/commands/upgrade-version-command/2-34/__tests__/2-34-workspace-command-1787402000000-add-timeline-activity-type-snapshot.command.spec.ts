import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { type WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { AddTimelineActivityTypeSnapshotCommand } from 'src/database/commands/upgrade-version-command/2-34/2-34-workspace-command-1787402000000-add-timeline-activity-type-snapshot.command';
import { type ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const WORKSPACE_ID = '00000000-0000-4000-8000-000000000001';
const APPLICATION_ID = '00000000-0000-4000-8000-000000000002';
const APPLICATION_UNIVERSAL_IDENTIFIER =
  '00000000-0000-4000-8000-000000000003';
describe('AddTimelineActivityTypeSnapshotCommand', () => {
  it('repairs rolling-upgrade rows while compatibility fields stay nullable', async () => {
    const validateBuildAndRunLegacyWorkspaceMigration = jest
      .fn()
      .mockResolvedValue({ status: 'success' });
    const query = jest.fn().mockResolvedValue([[], 0]);
    const getOrRecompute = jest
      .fn()
      .mockResolvedValueOnce({
        flatObjectMetadataMaps: {
          byUniversalIdentifier: {
            [STANDARD_OBJECTS.timelineActivity.universalIdentifier]: {
              id: '00000000-0000-4000-8000-000000000007',
              universalIdentifier:
                STANDARD_OBJECTS.timelineActivity.universalIdentifier,
            },
          },
        },
      })
      .mockResolvedValueOnce({
        flatFieldMetadataMaps: { byUniversalIdentifier: {} },
      })
      .mockResolvedValueOnce({
        flatTimelineActivityTypeMaps: {
          byUniversalIdentifier: {
            linked: {
              id: '00000000-0000-4000-8000-000000000008',
              applicationId: APPLICATION_ID,
              universalIdentifier:
                '00000000-0000-4000-8000-000000000009',
              name: 'recordLinked',
              label: 'was linked by',
              action: 'linked',
              icon: null,
              objectUniversalIdentifier: null,
              frontComponentUniversalIdentifier: null,
            },
          },
        },
      });
    const command = new AddTimelineActivityTypeSnapshotCommand(
      {} as WorkspaceIteratorService,
      {
        findWorkspaceTwentyStandardAndCustomApplicationOrThrow: jest
          .fn()
          .mockResolvedValue({
            twentyStandardFlatApplication: {
              id: APPLICATION_ID,
              universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
            },
          }),
      } as unknown as ApplicationService,
      { getOrRecompute } as unknown as WorkspaceCacheService,
      {
        validateBuildAndRunLegacyWorkspaceMigration,
      } as unknown as WorkspaceMigrationValidateBuildAndRunService,
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
      'WHERE "timelineActivityTypeId" IS NULL',
    );
    expect(query.mock.calls[1][0]).toContain(
      'WHERE timeline_activity."timelineActivityTypeSnapshot" IS NULL',
    );

    const createOperation =
      validateBuildAndRunLegacyWorkspaceMigration.mock.calls[0][0]
        .allFlatEntityOperationByMetadataName.fieldMetadata;
    expect(createOperation.flatEntityToCreate).toEqual([
      expect.objectContaining({
        name: 'timelineActivityTypeSnapshot',
        isNullable: true,
      }),
    ]);
    expect(validateBuildAndRunLegacyWorkspaceMigration).toHaveBeenCalledTimes(
      1,
    );
  });
});

import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { type WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { RepairTimelineActivitySearchVectorCommand } from 'src/database/commands/upgrade-version-command/2-36/2-36-workspace-command-1787747735000-repair-timeline-activity-search-vector.command';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';
import { type WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/workspace-migration-runner.service';

const WORKSPACE_ID = '00000000-0000-4000-8000-000000000001';
const TIMELINE_ACTIVITY_OBJECT_ID = '00000000-0000-4000-8000-000000000002';
const SEARCH_VECTOR_FIELD_ID = '00000000-0000-4000-8000-000000000003';

const buildCommand = ({
  hasSearchVectorColumn,
}: {
  hasSearchVectorColumn: boolean;
}) => {
  const query = jest
    .fn()
    .mockResolvedValue([{ exists: hasSearchVectorColumn }]);
  const run = jest.fn().mockResolvedValue(undefined);
  const command = new RepairTimelineActivitySearchVectorCommand(
    {} as WorkspaceIteratorService,
    {
      getOrRecompute: jest.fn().mockResolvedValue({
        flatObjectMetadataMaps: {
          byUniversalIdentifier: {
            [STANDARD_OBJECTS.timelineActivity.universalIdentifier]: {
              id: TIMELINE_ACTIVITY_OBJECT_ID,
              universalIdentifier:
                STANDARD_OBJECTS.timelineActivity.universalIdentifier,
              nameSingular: 'timelineActivity',
              isCustom: false,
            },
          },
        },
        flatFieldMetadataMaps: {
          byUniversalIdentifier: {
            [STANDARD_OBJECTS.timelineActivity.fields.searchVector
              .universalIdentifier]: {
              id: SEARCH_VECTOR_FIELD_ID,
              universalIdentifier:
                STANDARD_OBJECTS.timelineActivity.fields.searchVector
                  .universalIdentifier,
              name: 'searchVector',
            },
          },
        },
      }),
    } as unknown as WorkspaceCacheService,
    { run } as unknown as WorkspaceMigrationRunnerService,
  );

  return { command, dataSource: { query }, query, run };
};

const runCommand = (
  context: ReturnType<typeof buildCommand>,
  { dryRun = false }: { dryRun?: boolean } = {},
) =>
  context.command.runOnWorkspace({
    workspaceId: WORKSPACE_ID,
    dataSource: context.dataSource as never,
    options: { dryRun },
    index: 0,
    total: 1,
  });

describe('RepairTimelineActivitySearchVectorCommand', () => {
  it('rebuilds a missing timeline activity search vector', async () => {
    const context = buildCommand({ hasSearchVectorColumn: false });

    await runCommand(context);

    expect(context.run).toHaveBeenCalledWith({
      workspaceMigration: {
        applicationUniversalIdentifier:
          TWENTY_STANDARD_APPLICATION.universalIdentifier,
        actions: [
          {
            type: 'update',
            metadataName: 'fieldMetadata',
            universalIdentifier:
              STANDARD_OBJECTS.timelineActivity.fields.searchVector
                .universalIdentifier,
            update: {},
            rebuildSearchVector: true,
          },
        ],
      },
      workspaceId: WORKSPACE_ID,
    });
  });

  it('does nothing when the search vector column exists', async () => {
    const context = buildCommand({ hasSearchVectorColumn: true });

    await runCommand(context);

    expect(context.run).not.toHaveBeenCalled();
  });

  it('reports a missing column without rebuilding during a dry run', async () => {
    const context = buildCommand({ hasSearchVectorColumn: false });

    await runCommand(context, { dryRun: true });

    expect(context.query).toHaveBeenCalled();
    expect(context.run).not.toHaveBeenCalled();
  });
});

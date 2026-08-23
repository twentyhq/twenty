import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { type WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { AddAttachmentTimelineActivityTypesCommand } from 'src/database/commands/upgrade-version-command/2-34/2-34-workspace-command-1787446292650-add-attachment-timeline-activity-types.command';
import { type ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const WORKSPACE_ID = '00000000-0000-4000-8000-000000000001';
const STANDARD_APPLICATION_ID = '00000000-0000-4000-8000-000000000002';
const LINKED_TYPE_UNIVERSAL_IDENTIFIER = '20202020-0d1a-4f0e-8a55-1c0a2f0a2c11';
const UNLINKED_TYPE_UNIVERSAL_IDENTIFIER =
  '20202020-0d1a-4f0e-8a55-1c0a2f0a2c12';

const buildCommand = ({
  flatTimelineActivityTypes = {},
  hasTimelineActivity = true,
  migrationResult = { status: 'success' },
}: {
  flatTimelineActivityTypes?: Record<string, object>;
  hasTimelineActivity?: boolean;
  migrationResult?: { status: 'success' | 'fail' };
}) => {
  const validateBuildAndRunWorkspaceMigration = jest
    .fn()
    .mockResolvedValue(migrationResult);
  const findStandardApplication = jest.fn().mockResolvedValue({
    twentyStandardFlatApplication: { id: STANDARD_APPLICATION_ID },
  });
  const command = new AddAttachmentTimelineActivityTypesCommand(
    {} as WorkspaceIteratorService,
    {
      findWorkspaceTwentyStandardAndCustomApplicationOrThrow:
        findStandardApplication,
    } as unknown as ApplicationService,
    {
      getOrRecompute: jest.fn().mockResolvedValue({
        flatObjectMetadataMaps: {
          byUniversalIdentifier: hasTimelineActivity
            ? { [STANDARD_OBJECTS.timelineActivity.universalIdentifier]: {} }
            : {},
        },
        flatTimelineActivityTypeMaps: {
          byUniversalIdentifier: flatTimelineActivityTypes,
        },
      }),
    } as unknown as WorkspaceCacheService,
    {
      validateBuildAndRunWorkspaceMigration,
    } as unknown as WorkspaceMigrationValidateBuildAndRunService,
  );

  return {
    command,
    findStandardApplication,
    validateBuildAndRunWorkspaceMigration,
  };
};

const runCommand = (command: AddAttachmentTimelineActivityTypesCommand) =>
  command.runOnWorkspace({
    workspaceId: WORKSPACE_ID,
    options: {},
    index: 0,
    total: 1,
  });

describe('AddAttachmentTimelineActivityTypesCommand', () => {
  it('creates both frozen attachment activity definitions', async () => {
    const { command, validateBuildAndRunWorkspaceMigration } = buildCommand({});

    await runCommand(command);

    const operation =
      validateBuildAndRunWorkspaceMigration.mock.calls[0][0]
        .allFlatEntityOperationByMetadataName.timelineActivityType;

    expect(operation.flatEntityToCreate).toEqual([
      expect.objectContaining({
        universalIdentifier: LINKED_TYPE_UNIVERSAL_IDENTIFIER,
        action: 'linked',
        name: 'attachmentLinked',
        objectUniversalIdentifier:
          STANDARD_OBJECTS.attachment.universalIdentifier,
        targetRelationFieldUniversalIdentifier:
          STANDARD_OBJECTS.attachment.fields.targetPerson.universalIdentifier,
      }),
      expect.objectContaining({
        universalIdentifier: UNLINKED_TYPE_UNIVERSAL_IDENTIFIER,
        action: 'unlinked',
        name: 'attachmentUnlinked',
      }),
    ]);
  });

  it('only creates a missing definition when an upgrade resumes', async () => {
    const { command, validateBuildAndRunWorkspaceMigration } = buildCommand({
      flatTimelineActivityTypes: {
        [LINKED_TYPE_UNIVERSAL_IDENTIFIER]: {},
      },
    });

    await runCommand(command);

    const createdTypes =
      validateBuildAndRunWorkspaceMigration.mock.calls[0][0]
        .allFlatEntityOperationByMetadataName.timelineActivityType
        .flatEntityToCreate;

    expect(createdTypes).toHaveLength(1);
    expect(createdTypes[0].universalIdentifier).toBe(
      UNLINKED_TYPE_UNIVERSAL_IDENTIFIER,
    );
  });

  it('does nothing when standard sync already created both definitions', async () => {
    const {
      command,
      findStandardApplication,
      validateBuildAndRunWorkspaceMigration,
    } = buildCommand({
      flatTimelineActivityTypes: {
        [LINKED_TYPE_UNIVERSAL_IDENTIFIER]: {},
        [UNLINKED_TYPE_UNIVERSAL_IDENTIFIER]: {},
      },
    });

    await runCommand(command);

    expect(findStandardApplication).not.toHaveBeenCalled();
    expect(validateBuildAndRunWorkspaceMigration).not.toHaveBeenCalled();
  });

  it('skips workspaces that predate timeline metadata', async () => {
    const {
      command,
      findStandardApplication,
      validateBuildAndRunWorkspaceMigration,
    } = buildCommand({ hasTimelineActivity: false });

    await runCommand(command);

    expect(findStandardApplication).not.toHaveBeenCalled();
    expect(validateBuildAndRunWorkspaceMigration).not.toHaveBeenCalled();
  });

  it('fails the upgrade when metadata creation fails', async () => {
    const { command } = buildCommand({ migrationResult: { status: 'fail' } });

    await expect(runCommand(command)).rejects.toThrow(
      'Failed to add attachment timeline activity types',
    );
  });
});

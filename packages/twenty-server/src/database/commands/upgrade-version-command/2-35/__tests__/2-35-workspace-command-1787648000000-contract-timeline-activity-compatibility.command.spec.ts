import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { type WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { ContractTimelineActivityCompatibilityCommand } from 'src/database/commands/upgrade-version-command/2-35/2-35-workspace-command-1787648000000-contract-timeline-activity-compatibility.command';
import { type ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const WORKSPACE_ID = '00000000-0000-4000-8000-000000000001';
const APPLICATION_UNIVERSAL_IDENTIFIER = '00000000-0000-4000-8000-000000000002';
const LEGACY_NAME_FIELD_UNIVERSAL_IDENTIFIER =
  '20202020-7207-46e8-9dab-849505ae8497';

const buildField = ({
  universalIdentifier,
  isNullable,
}: {
  universalIdentifier: string;
  isNullable: boolean;
}) => ({
  id: universalIdentifier,
  universalIdentifier,
  isNullable,
});

const buildCommand = ({
  audit = {
    missingTypeIdCount: '0',
    missingSnapshotCount: '0',
    danglingTypeIdCount: '0',
  },
  includeLegacyName = true,
  migrationResult = { status: 'success' },
}: {
  audit?: {
    missingTypeIdCount: string;
    missingSnapshotCount: string;
    danglingTypeIdCount: string;
  };
  includeLegacyName?: boolean;
  migrationResult?: { status: 'success' | 'fail' };
} = {}) => {
  const legacyNameField = buildField({
    universalIdentifier: LEGACY_NAME_FIELD_UNIVERSAL_IDENTIFIER,
    isNullable: true,
  });
  const validateBuildAndRunLegacyWorkspaceMigration = jest
    .fn()
    .mockResolvedValue(migrationResult);
  const query = jest.fn().mockResolvedValue([audit]);
  const command = new ContractTimelineActivityCompatibilityCommand(
    {} as WorkspaceIteratorService,
    {
      findWorkspaceTwentyStandardAndCustomApplicationOrThrow: jest
        .fn()
        .mockResolvedValue({
          twentyStandardFlatApplication: {
            universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
          },
        }),
    } as unknown as ApplicationService,
    {
      getOrRecompute: jest.fn().mockResolvedValue({
        flatObjectMetadataMaps: {
          byUniversalIdentifier: {
            [STANDARD_OBJECTS.timelineActivity.universalIdentifier]: {},
          },
        },
        flatFieldMetadataMaps: {
          byUniversalIdentifier: {
            ...(includeLegacyName
              ? {
                  [LEGACY_NAME_FIELD_UNIVERSAL_IDENTIFIER]: legacyNameField,
                }
              : {}),
          },
        },
        flatTimelineActivityTypeMaps: {
          byUniversalIdentifier: {
            '00000000-0000-4000-8000-000000000003': {
              id: '00000000-0000-4000-8000-000000000004',
              action: 'linked',
              objectUniversalIdentifier: null,
            },
          },
        },
      }),
    } as unknown as WorkspaceCacheService,
    {
      validateBuildAndRunLegacyWorkspaceMigration,
    } as unknown as WorkspaceMigrationValidateBuildAndRunService,
  );

  return {
    command,
    dataSource: { query },
    query,
    legacyNameField,
    validateBuildAndRunLegacyWorkspaceMigration,
  };
};

describe('ContractTimelineActivityCompatibilityCommand', () => {
  it('drops name only after a clean audit', async () => {
    const {
      command,
      dataSource,
      legacyNameField,
      validateBuildAndRunLegacyWorkspaceMigration,
    } = buildCommand();

    await command.runOnWorkspace({
      workspaceId: WORKSPACE_ID,
      dataSource: dataSource as never,
      options: {},
      index: 0,
      total: 1,
    });

    expect(validateBuildAndRunLegacyWorkspaceMigration).toHaveBeenCalledWith(
      expect.objectContaining({
        isSystemBuild: true,
        workspaceId: WORKSPACE_ID,
        applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
        allFlatEntityOperationByMetadataName: {
          fieldMetadata: {
            flatEntityToCreate: [],
            flatEntityToDelete: [legacyNameField],
            flatEntityToUpdate: [],
          },
        },
      }),
    );
  });

  it('is idempotent after the compatibility fields are contracted', async () => {
    const { command, dataSource, validateBuildAndRunLegacyWorkspaceMigration } =
      buildCommand({ includeLegacyName: false });

    await command.runOnWorkspace({
      workspaceId: WORKSPACE_ID,
      dataSource: dataSource as never,
      options: {},
      index: 0,
      total: 1,
    });

    expect(validateBuildAndRunLegacyWorkspaceMigration).not.toHaveBeenCalled();
  });

  it('does not mutate data or metadata during a dry run', async () => {
    const {
      command,
      dataSource,
      query,
      validateBuildAndRunLegacyWorkspaceMigration,
    } = buildCommand({
      audit: {
        missingTypeIdCount: '2',
        missingSnapshotCount: '3',
        danglingTypeIdCount: '1',
      },
    });

    await command.runOnWorkspace({
      workspaceId: WORKSPACE_ID,
      dataSource: dataSource as never,
      options: { dryRun: true },
      index: 0,
      total: 1,
    });

    expect(query).toHaveBeenCalledTimes(1);
    expect(validateBuildAndRunLegacyWorkspaceMigration).not.toHaveBeenCalled();
  });

  it('repairs missing rows without rewriting dangling historical references', async () => {
    const {
      command,
      dataSource,
      query,
      validateBuildAndRunLegacyWorkspaceMigration,
    } = buildCommand({
      audit: {
        missingTypeIdCount: '1',
        missingSnapshotCount: '1',
        danglingTypeIdCount: '1',
      },
    });

    query
      .mockReset()
      .mockResolvedValueOnce([
        {
          missingTypeIdCount: '1',
          missingSnapshotCount: '1',
          danglingTypeIdCount: '1',
        },
      ])
      .mockResolvedValueOnce([[], 0])
      .mockResolvedValueOnce([[], 0])
      .mockResolvedValueOnce([
        {
          missingTypeIdCount: '0',
          missingSnapshotCount: '0',
          danglingTypeIdCount: '1',
        },
      ]);

    await command.runOnWorkspace({
      workspaceId: WORKSPACE_ID,
      dataSource: dataSource as never,
      options: {},
      index: 0,
      total: 1,
    });

    expect(query).toHaveBeenCalledTimes(4);
    expect(query.mock.calls[1][0]).toContain(
      'WHERE "timelineActivityTypeId" IS NULL',
    );
    expect(query.mock.calls[2][0]).toContain(
      'WHERE timeline_activity."timelineActivityTypeSnapshot" IS NULL',
    );
    expect(
      query.mock.calls.some(([sql]) =>
        sql.includes('SET "timelineActivityTypeId" = NULL'),
      ),
    ).toBe(false);
    expect(validateBuildAndRunLegacyWorkspaceMigration).toHaveBeenCalledTimes(
      1,
    );
  });

  it('accepts a historical snapshot whose live type was uninstalled', async () => {
    const { command, dataSource, validateBuildAndRunLegacyWorkspaceMigration } =
      buildCommand({
        includeLegacyName: false,
        audit: {
          missingTypeIdCount: '0',
          missingSnapshotCount: '0',
          danglingTypeIdCount: '1',
        },
      });

    await command.runOnWorkspace({
      workspaceId: WORKSPACE_ID,
      dataSource: dataSource as never,
      options: {},
      index: 0,
      total: 1,
    });

    expect(validateBuildAndRunLegacyWorkspaceMigration).not.toHaveBeenCalled();
  });

  it('does not block contraction on an unrepairable missing historical snapshot', async () => {
    const { command, dataSource, query } = buildCommand({
      includeLegacyName: false,
      audit: {
        missingTypeIdCount: '0',
        missingSnapshotCount: '0',
        danglingTypeIdCount: '1',
      },
    });

    await command.runOnWorkspace({
      workspaceId: WORKSPACE_ID,
      dataSource: dataSource as never,
      options: {},
      index: 0,
      total: 1,
    });

    expect(query).toHaveBeenCalledTimes(2);
    expect(query.mock.calls[0][0]).toContain(
      'OR timeline_activity_type."id" IS NOT NULL',
    );
  });

  it('continues the type ID backfill while PostgreSQL reports full batches', async () => {
    const { command, dataSource, query } = buildCommand({
      audit: {
        missingTypeIdCount: '5002',
        missingSnapshotCount: '0',
        danglingTypeIdCount: '0',
      },
    });

    query
      .mockReset()
      .mockResolvedValueOnce([
        {
          missingTypeIdCount: '5002',
          missingSnapshotCount: '0',
          danglingTypeIdCount: '0',
        },
      ])
      .mockResolvedValueOnce([[], 5000])
      .mockResolvedValueOnce([[], 2])
      .mockResolvedValueOnce([
        {
          missingTypeIdCount: '0',
          missingSnapshotCount: '0',
          danglingTypeIdCount: '0',
        },
      ]);

    await command.runOnWorkspace({
      workspaceId: WORKSPACE_ID,
      dataSource: dataSource as never,
      options: {},
      index: 0,
      total: 1,
    });

    expect(query).toHaveBeenCalledTimes(4);
    expect(query.mock.calls[1][0]).toContain(
      'WHERE "timelineActivityTypeId" IS NULL',
    );
    expect(query.mock.calls[2][0]).toContain(
      'WHERE "timelineActivityTypeId" IS NULL',
    );
  });

  it('refuses unresolved references when the legacy repair source is gone', async () => {
    const { command, dataSource } = buildCommand({
      includeLegacyName: false,
      audit: {
        missingTypeIdCount: '1',
        missingSnapshotCount: '1',
        danglingTypeIdCount: '0',
      },
    });

    await expect(
      command.runOnWorkspace({
        workspaceId: WORKSPACE_ID,
        dataSource: dataSource as never,
        options: {},
        index: 0,
        total: 1,
      }),
    ).rejects.toThrow('no legacy name field to repair them from');
  });
});

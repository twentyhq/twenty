import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { type DataSource } from 'typeorm';

import { type WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { RepairTimelineActivityTargetFieldNamesCommand } from 'src/database/commands/upgrade-version-command/2-35/2-35-workspace-command-1787641226000-repair-timeline-activity-target-field-names.command';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const WORKSPACE_ID = '00000000-0000-4000-8000-000000000001';
const TIMELINE_ACTIVITY_OBJECT_ID = '00000000-0000-4000-8000-000000000002';
const TARGET_OBJECT_ID = '00000000-0000-4000-8000-000000000003';
const TARGET_FIELD_ID = '00000000-0000-4000-8000-000000000005';
const TARGET_FIELD_UNIVERSAL_IDENTIFIER =
  '00000000-0000-4000-8000-000000000006';
const APPLICATION_UNIVERSAL_IDENTIFIER = '00000000-0000-4000-8000-000000000007';
const TARGET_INDEX_ID = '00000000-0000-4000-8000-000000000008';
const TARGET_INDEX_UNIVERSAL_IDENTIFIER =
  '00000000-0000-4000-8000-000000000009';
const TARGET_OBJECT_UNIVERSAL_IDENTIFIER =
  '00000000-0000-4000-8000-000000000004';

const buildCommand = ({
  targetFieldName = 'targetPhoneNumber',
  columnNames = ['targetPhoneNumberId'],
  migrationResult = { status: 'success' },
}: {
  targetFieldName?: string;
  columnNames?: string[];
  migrationResult?: { status: 'success' | 'fail' };
} = {}) => {
  const validateBuildAndRunLegacyWorkspaceMigration = jest
    .fn()
    .mockResolvedValue(migrationResult);
  const command = new RepairTimelineActivityTargetFieldNamesCommand(
    {} as WorkspaceIteratorService,
    {
      getOrRecompute: jest.fn().mockResolvedValue({
        flatObjectMetadataMaps: {
          byUniversalIdentifier: {
            [STANDARD_OBJECTS.timelineActivity.universalIdentifier]: {
              id: TIMELINE_ACTIVITY_OBJECT_ID,
              universalIdentifier:
                STANDARD_OBJECTS.timelineActivity.universalIdentifier,
              applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
              nameSingular: 'timelineActivity',
              namePlural: 'timelineActivities',
              isCustom: false,
              fieldIds: [TARGET_FIELD_ID],
              indexMetadataIds: [TARGET_INDEX_ID],
            },
            [TARGET_OBJECT_UNIVERSAL_IDENTIFIER]: {
              id: TARGET_OBJECT_ID,
              universalIdentifier: TARGET_OBJECT_UNIVERSAL_IDENTIFIER,
              nameSingular: 'phoneNumber2',
            },
          },
          universalIdentifierById: {
            [TIMELINE_ACTIVITY_OBJECT_ID]:
              STANDARD_OBJECTS.timelineActivity.universalIdentifier,
            [TARGET_OBJECT_ID]: TARGET_OBJECT_UNIVERSAL_IDENTIFIER,
          },
          universalIdentifiersByApplicationId: {},
        },
        flatFieldMetadataMaps: {
          byUniversalIdentifier: {
            [TARGET_FIELD_UNIVERSAL_IDENTIFIER]: {
              id: TARGET_FIELD_ID,
              universalIdentifier: TARGET_FIELD_UNIVERSAL_IDENTIFIER,
              applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
              objectMetadataId: TIMELINE_ACTIVITY_OBJECT_ID,
              relationTargetObjectMetadataId: TARGET_OBJECT_ID,
              type: FieldMetadataType.MORPH_RELATION,
              morphId:
                STANDARD_OBJECTS.timelineActivity.morphIds.targetMorphId
                  .morphId,
              name: targetFieldName,
              label: 'PhoneNumber',
              isUnique: false,
              isSystemSideEffect: true,
              universalSettings: {
                relationType: RelationType.MANY_TO_ONE,
                joinColumnName: `${targetFieldName}Id`,
              },
            },
          },
          universalIdentifierById: {
            [TARGET_FIELD_ID]: TARGET_FIELD_UNIVERSAL_IDENTIFIER,
          },
          universalIdentifiersByApplicationId: {},
        },
        flatIndexMaps: {
          byUniversalIdentifier: {
            [TARGET_INDEX_UNIVERSAL_IDENTIFIER]: {
              id: TARGET_INDEX_ID,
              universalIdentifier: TARGET_INDEX_UNIVERSAL_IDENTIFIER,
              applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
              objectMetadataId: TIMELINE_ACTIVITY_OBJECT_ID,
              name: 'IDX_STALE_TARGET_PHONE_NUMBER_ID',
              isUnique: false,
              indexWhereClause: null,
              flatIndexFieldMetadatas: [
                {
                  fieldMetadataId: TARGET_FIELD_ID,
                  order: 0,
                  subFieldName: null,
                },
              ],
              universalFlatIndexFieldMetadatas: [
                {
                  fieldMetadataUniversalIdentifier:
                    TARGET_FIELD_UNIVERSAL_IDENTIFIER,
                  order: 0,
                  subFieldName: null,
                },
              ],
            },
          },
          universalIdentifierById: {
            [TARGET_INDEX_ID]: TARGET_INDEX_UNIVERSAL_IDENTIFIER,
          },
          universalIdentifiersByApplicationId: {},
        },
      }),
    } as unknown as WorkspaceCacheService,
    {
      validateBuildAndRunLegacyWorkspaceMigration,
    } as unknown as WorkspaceMigrationValidateBuildAndRunService,
  );

  const dataSource = {
    query: jest
      .fn()
      .mockResolvedValue(columnNames.map((name) => ({ column_name: name }))),
  } as unknown as DataSource;

  return { command, dataSource, validateBuildAndRunLegacyWorkspaceMigration };
};

const runCommand = (
  {
    command,
    dataSource,
  }: Pick<ReturnType<typeof buildCommand>, 'command' | 'dataSource'>,
  { dryRun = false, withDataSource = true } = {},
) =>
  command.runOnWorkspace({
    workspaceId: WORKSPACE_ID,
    dataSource: withDataSource ? dataSource : undefined,
    options: { dryRun },
    index: 0,
    total: 1,
  });

describe('RepairTimelineActivityTargetFieldNamesCommand', () => {
  it('submits the renamed field and its recomputed index in one migration', async () => {
    const context = buildCommand();

    await runCommand(context);

    expect(
      context.validateBuildAndRunLegacyWorkspaceMigration,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        isSystemBuild: true,
        workspaceId: WORKSPACE_ID,
        applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
        allFlatEntityOperationByMetadataName: {
          fieldMetadata: {
            flatEntityToCreate: [],
            flatEntityToDelete: [],
            flatEntityToUpdate: [
              expect.objectContaining({
                universalIdentifier: TARGET_FIELD_UNIVERSAL_IDENTIFIER,
                name: 'targetPhoneNumber2',
                label: 'PhoneNumber2',
                universalSettings: expect.objectContaining({
                  joinColumnName: 'targetPhoneNumber2Id',
                }),
              }),
            ],
          },
          index: {
            flatEntityToCreate: [],
            flatEntityToDelete: [],
            flatEntityToUpdate: [
              expect.objectContaining({
                universalIdentifier: TARGET_INDEX_UNIVERSAL_IDENTIFIER,
              }),
            ],
          },
        },
      }),
    );
  });

  it('does nothing when the target field already matches the object name', async () => {
    const context = buildCommand({
      targetFieldName: 'targetPhoneNumber2',
      columnNames: ['targetPhoneNumber2Id'],
    });

    await runCommand(context);

    expect(
      context.validateBuildAndRunLegacyWorkspaceMigration,
    ).not.toHaveBeenCalled();
  });

  it('reports manual repair and runs no migration when the column was already renamed', async () => {
    const context = buildCommand({ columnNames: ['targetPhoneNumber2Id'] });
    const errorSpy = jest.spyOn(context.command['logger'], 'error');

    await runCommand(context);

    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('MANUAL REPAIR REQUIRED'),
    );
    expect(
      context.validateBuildAndRunLegacyWorkspaceMigration,
    ).not.toHaveBeenCalled();
  });

  it('skips the workspace when no data source is available to verify columns', async () => {
    const context = buildCommand();
    const errorSpy = jest.spyOn(context.command['logger'], 'error');

    await runCommand(context, { withDataSource: false });

    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('no data source'),
    );
    expect(
      context.validateBuildAndRunLegacyWorkspaceMigration,
    ).not.toHaveBeenCalled();
  });

  it('does not mutate metadata during a dry run', async () => {
    const context = buildCommand();

    await runCommand(context, { dryRun: true });

    expect(
      context.validateBuildAndRunLegacyWorkspaceMigration,
    ).not.toHaveBeenCalled();
  });

  it('fails when the workspace migration is rejected', async () => {
    const context = buildCommand({ migrationResult: { status: 'fail' } });

    await expect(runCommand(context)).rejects.toThrow(
      'Failed to repair timeline activity target fields',
    );
  });
});

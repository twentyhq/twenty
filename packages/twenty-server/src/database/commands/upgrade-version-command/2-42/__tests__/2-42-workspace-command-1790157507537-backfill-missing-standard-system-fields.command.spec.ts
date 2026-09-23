import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';
import { type FeatureFlagKey } from 'twenty-shared/types';

import { type WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { BackfillMissingStandardSystemFieldsCommand } from 'src/database/commands/upgrade-version-command/2-42/2-42-workspace-command-1790157507537-backfill-missing-standard-system-fields.command';
import { type ApplicationService } from 'src/engine/core-modules/application/application.service';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { FlatFieldMetadataTypeValidatorService } from 'src/engine/metadata-modules/flat-field-metadata/services/flat-field-metadata-type-validator.service';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { EMPTY_ORCHESTRATOR_FAILURE_REPORT } from 'src/engine/workspace-manager/workspace-migration/constant/empty-orchestrator-failure-report.constant';
import { type WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { FlatFieldMetadataValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-field-metadata-validator.service';
import { FlatViewFieldValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-view-field-validator.service';

const WORKSPACE_ID = '20202020-1111-4111-8111-111111111111';
const APPLICATION_ID = '20202020-2222-4222-8222-222222222222';
const MISSING_FIELD_NAMES = [
  'createdBy',
  'updatedBy',
  'position',
  'searchVector',
] as const;
const AFFECTED_OBJECTS = [
  STANDARD_OBJECTS.message,
  STANDARD_OBJECTS.calendarEvent,
];
const MISSING_IDENTIFIERS = AFFECTED_OBJECTS.flatMap((objectMetadata) =>
  MISSING_FIELD_NAMES.map((name) => objectMetadata.fields[name].universalIdentifier),
);

type MigrationArgs = Parameters<
  WorkspaceMigrationValidateBuildAndRunService['validateBuildAndRunWorkspaceMigration']
>[0];

const buildStandardMaps = () =>
  computeTwentyStandardApplicationAllFlatEntityMaps({
    now: '2026-09-23T00:00:00.000Z',
    workspaceId: WORKSPACE_ID,
    twentyStandardApplicationId: APPLICATION_ID,
  }).allFlatEntityMaps;

describe('BackfillMissingStandardSystemFieldsCommand', () => {
  let maps: ReturnType<typeof buildStandardMaps>;
  let command: BackfillMissingStandardSystemFieldsCommand;
  const migrate = jest.fn();
  const fieldValidator = new FlatFieldMetadataValidatorService(
    new FlatFieldMetadataTypeValidatorService(),
  );
  const viewFieldValidator = new FlatViewFieldValidatorService();
  const run = (dryRun = false) =>
    command.runOnWorkspace({
      workspaceId: WORKSPACE_ID,
      options: { dryRun },
      index: 0,
      total: 1,
    });

  beforeEach(() => {
    maps = buildStandardMaps();
    for (const universalIdentifier of MISSING_IDENTIFIERS) {
      delete maps.flatFieldMetadataMaps.byUniversalIdentifier[
        universalIdentifier
      ];
    }
    for (const objectMetadata of Object.values(
      maps.flatObjectMetadataMaps.byUniversalIdentifier,
    ).filter(isDefined)) {
      objectMetadata.fieldUniversalIdentifiers =
        objectMetadata.fieldUniversalIdentifiers.filter(
          (identifier) => !MISSING_IDENTIFIERS.includes(identifier),
        );
    }
    migrate.mockReset();
    migrate.mockImplementation(async (args: MigrationArgs) => {
      const report = EMPTY_ORCHESTRATOR_FAILURE_REPORT();
      for (const fieldMetadata of args.allFlatEntityOperationByMetadataName
        .fieldMetadata?.flatEntityToCreate ?? []) {
        const validation = fieldValidator.validateFlatFieldMetadataCreation({
          flatEntityToValidate: fieldMetadata,
          optimisticFlatEntityMapsAndRelatedFlatEntityMaps: maps,
          remainingFlatEntityMapsToValidate: createEmptyFlatEntityMaps(),
          workspaceId: WORKSPACE_ID,
          additionalCacheDataMaps: {
            featureFlagsMap: {} as Record<FeatureFlagKey, boolean>,
          },
          buildOptions: {
            isSystemBuild: true,
            applicationUniversalIdentifier:
              TWENTY_STANDARD_APPLICATION.universalIdentifier,
          },
        });
        if (validation.errors.length > 0) report.fieldMetadata.push(validation);
      }
      if (report.fieldMetadata.length > 0) return { status: 'fail', report };
      if (!args.dryRun) {
        for (const fieldMetadata of args.allFlatEntityOperationByMetadataName
          .fieldMetadata?.flatEntityToCreate ?? []) {
          maps.flatFieldMetadataMaps.byUniversalIdentifier[
            fieldMetadata.universalIdentifier
          ] = fieldMetadata as FlatFieldMetadata;
        }
      }
      return { status: 'success' };
    });
    command = new BackfillMissingStandardSystemFieldsCommand(
      {} as WorkspaceIteratorService,
      {
        findWorkspaceTwentyStandardAndCustomApplicationOrThrow: jest
          .fn()
          .mockResolvedValue({
            twentyStandardFlatApplication: {
              id: APPLICATION_ID,
              universalIdentifier:
                TWENTY_STANDARD_APPLICATION.universalIdentifier,
            },
          }),
      } as unknown as ApplicationService,
      {
        getOrRecompute: jest.fn().mockImplementation(async () => maps),
      } as unknown as WorkspaceCacheService,
      {
        validateBuildAndRunWorkspaceMigration: migrate,
      } as unknown as WorkspaceMigrationValidateBuildAndRunService,
    );
  });

  const validateCreatedByViewField = () => {
    const viewField =
      maps.flatViewFieldMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.message.views.messageRecordPageFields.viewFields
          .createdBy.universalIdentifier
      ]!;
    const view =
      maps.flatViewMaps.byUniversalIdentifier[
        viewField.viewUniversalIdentifier
      ]!;
    return viewFieldValidator.validateFlatViewFieldCreation({
      flatEntityToValidate: viewField,
      optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
        ...maps,
        flatViewFieldMaps: createEmptyFlatEntityMaps(),
        flatViewMaps: {
          byUniversalIdentifier: {
            [view.universalIdentifier]: {
              ...view,
              viewFieldUniversalIdentifiers: [],
            },
          },
        },
      },
      remainingFlatEntityMapsToValidate: createEmptyFlatEntityMaps(),
      additionalCacheDataMaps: {
        featureFlagsMap: {} as Record<FeatureFlagKey, boolean>,
      },
      buildOptions: {
        isSystemBuild: true,
        applicationUniversalIdentifier:
          TWENTY_STANDARD_APPLICATION.universalIdentifier,
      },
      workspaceId: WORKSPACE_ID,
    });
  };

  it('reproduces the message page failure with the real validator and repairs its missing dependency', async () => {
    expect(validateCreatedByViewField().errors).toEqual([
      expect.objectContaining({
        code: 'INVALID_VIEW_DATA',
        message: 'Field metadata not found',
      }),
    ]);
    await run();
    expect(validateCreatedByViewField().errors).toEqual([]);
    const operation = (migrate.mock.calls[0][0] as MigrationArgs)
      .allFlatEntityOperationByMetadataName.fieldMetadata!;
    expect(
      operation.flatEntityToCreate
        .map((fieldMetadata) => fieldMetadata.universalIdentifier)
        .sort(),
    ).toEqual([...MISSING_IDENTIFIERS].sort());
    expect(operation.flatEntityToUpdate).toEqual([]);
    expect(operation.flatEntityToDelete).toEqual([]);
  });

  it('preserves existing fields and becomes a no-op after repair', async () => {
    const textField =
      maps.flatFieldMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.message.fields.text.universalIdentifier
      ]!;
    textField.label = 'Customized body';
    await run();
    await run();
    expect(migrate).toHaveBeenCalledTimes(1);
    expect(
      maps.flatFieldMetadataMaps.byUniversalIdentifier[
        textField.universalIdentifier
      ],
    ).toBe(textField);
    expect(textField.label).toBe('Customized body');
  });

  it('validates a dry run without applying the repair', async () => {
    await run(true);
    expect(migrate).toHaveBeenCalledWith(
      expect.objectContaining({ dryRun: true }),
    );
    expect(validateCreatedByViewField().errors).toHaveLength(1);
    await run();
    expect(validateCreatedByViewField().errors).toEqual([]);
  });

  it('fails on conflicting metadata instead of skipping it, including in dry runs', async () => {
    const fieldMetadata =
      buildStandardMaps().flatFieldMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.message.fields.createdBy.universalIdentifier
      ]!;
    const conflictingField = {
      ...fieldMetadata,
      universalIdentifier: '20202020-3333-4333-8333-333333333333',
    };
    maps.flatFieldMetadataMaps.byUniversalIdentifier[
      conflictingField.universalIdentifier
    ] = conflictingField;
    maps.flatObjectMetadataMaps.byUniversalIdentifier[
      STANDARD_OBJECTS.message.universalIdentifier
    ]!.fieldUniversalIdentifiers.push(conflictingField.universalIdentifier);
    await expect(run(true)).rejects.toMatchObject({
      failedWorkspaceMigrationBuildResult: {
        report: {
          fieldMetadata: [
            expect.objectContaining({
              errors: expect.arrayContaining([
                expect.objectContaining({ code: 'NOT_AVAILABLE' }),
              ]),
            }),
          ],
        },
      },
    });
    expect(validateCreatedByViewField().errors).toHaveLength(1);
  });

  it('does not provision fields on missing objects', async () => {
    delete maps.flatObjectMetadataMaps.byUniversalIdentifier[
      STANDARD_OBJECTS.message.universalIdentifier
    ];
    delete maps.flatObjectMetadataMaps.byUniversalIdentifier[
      STANDARD_OBJECTS.calendarEvent.universalIdentifier
    ];
    await run();
    expect(migrate).not.toHaveBeenCalled();
  });

  it('does not remove required fields or their data on rollback', async () => {
    await command.down({
      workspaceId: WORKSPACE_ID,
      options: {},
      index: 0,
      total: 1,
    });
    expect(migrate).not.toHaveBeenCalled();
  });
});

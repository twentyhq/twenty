import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import {
  capitalize,
  fromArrayToValuesByKeyRecord,
  isDefined,
} from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-flat-fields-for-flat-object-metadata.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

const buildTimelineActivityTargetFieldRepairs = ({
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): UniversalFlatFieldMetadata<FieldMetadataType.MORPH_RELATION>[] => {
  const timelineActivityObjectMetadata = findFlatEntityByUniversalIdentifier({
    flatEntityMaps: flatObjectMetadataMaps,
    universalIdentifier: STANDARD_OBJECTS.timelineActivity.universalIdentifier,
  });

  if (!isDefined(timelineActivityObjectMetadata)) {
    return [];
  }

  return getFlatFieldsFromFlatObjectMetadata(
    timelineActivityObjectMetadata,
    flatFieldMetadataMaps,
  ).flatMap((fieldMetadata) => {
    if (
      !isFlatFieldMetadataOfType(
        fieldMetadata,
        FieldMetadataType.MORPH_RELATION,
      ) ||
      fieldMetadata.morphId !==
        STANDARD_OBJECTS.timelineActivity.morphIds.targetMorphId.morphId ||
      fieldMetadata.universalSettings.relationType !==
        RelationType.MANY_TO_ONE ||
      !isDefined(fieldMetadata.relationTargetObjectMetadataId)
    ) {
      return [];
    }

    const targetObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityMaps: flatObjectMetadataMaps,
      flatEntityId: fieldMetadata.relationTargetObjectMetadataId,
    });

    if (!isDefined(targetObjectMetadata)) {
      return [];
    }

    const expectedName = `target${capitalize(
      targetObjectMetadata.nameSingular,
    )}`;
    const expectedJoinColumnName = computeMorphOrRelationFieldJoinColumnName({
      name: expectedName,
    });

    if (
      fieldMetadata.name === expectedName &&
      fieldMetadata.universalSettings.joinColumnName === expectedJoinColumnName
    ) {
      return [];
    }

    return [
      {
        ...fieldMetadata,
        name: expectedName,
        universalSettings: {
          ...fieldMetadata.universalSettings,
          joinColumnName: expectedJoinColumnName,
        },
      },
    ];
  });
};

@RegisteredWorkspaceCommand('2.35.0', 1787641226000)
@Command({
  name: 'upgrade:2-35:repair-timeline-activity-target-field-names',
  description:
    'Repair timeline activity target morph field names left stale by object renames',
})
export class RepairTimelineActivityTargetFieldNamesCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
      ]);
    const fieldsToRepair = buildTimelineActivityTargetFieldRepairs({
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });

    if (fieldsToRepair.length === 0) {
      return;
    }

    if (options.dryRun ?? false) {
      this.logger.log(
        `[DRY RUN] Would repair ${fieldsToRepair.length} timeline activity target field(s) for workspace ${workspaceId}`,
      );

      return;
    }

    const fieldsByApplicationUniversalIdentifier = fromArrayToValuesByKeyRecord(
      {
        array: fieldsToRepair,
        key: 'applicationUniversalIdentifier',
      },
    );

    for (const [
      applicationUniversalIdentifier,
      applicationFieldsToRepair,
    ] of Object.entries(fieldsByApplicationUniversalIdentifier)) {
      const result =
        await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
          {
            isSystemBuild: true,
            workspaceId,
            applicationUniversalIdentifier,
            allFlatEntityOperationByMetadataName: {
              fieldMetadata: {
                flatEntityToCreate: [],
                flatEntityToDelete: [],
                flatEntityToUpdate: applicationFieldsToRepair,
              },
            },
          },
        );

      if (result.status === 'fail') {
        throw new Error(
          `Failed to repair timeline activity target fields for workspace ${workspaceId}:\n${JSON.stringify(result, null, 2)}`,
        );
      }
    }
  }
}

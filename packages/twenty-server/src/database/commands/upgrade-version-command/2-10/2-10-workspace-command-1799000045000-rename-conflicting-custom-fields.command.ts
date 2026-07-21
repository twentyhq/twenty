import { Command } from 'nest-commander';

import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const NEW_STANDARD_FIELDS: {
  fieldName: string;
  objectUniversalIdentifier: string;
}[] = [
  {
    fieldName: 'annualRevenue',
    objectUniversalIdentifier: STANDARD_OBJECTS.company.universalIdentifier,
  },
];

const computeAvailableFieldName = (
  baseFieldName: string,
  takenFieldNames: Set<string>,
): string => {
  let candidateFieldName = `${baseFieldName}Custom`;
  let suffix = 2;

  while (takenFieldNames.has(candidateFieldName)) {
    candidateFieldName = `${baseFieldName}Custom${suffix}`;
    suffix++;
  }

  return candidateFieldName;
};

@RegisteredWorkspaceCommand('2.10.0', 1799000045000)
@Command({
  name: 'upgrade:2-10:rename-conflicting-custom-fields',
  description:
    'Rename a pre-existing custom field whose name collides with the new generic standard field (Company annualRevenue), preserving its data, so the standard field can be added',
})
export class RenameConflictingCustomFieldsCommand extends ProvisionedWorkspaceCommandRunner {
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
    const isDryRun = options.dryRun ?? false;

    const { flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
      ]);

    const allFlatFieldMetadatas = Object.values(
      flatFieldMetadataMaps.byUniversalIdentifier,
    ).filter(isDefined);

    const takenFieldNamesByObject = new Map<string, Set<string>>();

    for (const flatFieldMetadata of allFlatFieldMetadatas) {
      const takenFieldNames =
        takenFieldNamesByObject.get(
          flatFieldMetadata.objectMetadataUniversalIdentifier,
        ) ?? new Set<string>();

      takenFieldNames.add(flatFieldMetadata.name);
      takenFieldNamesByObject.set(
        flatFieldMetadata.objectMetadataUniversalIdentifier,
        takenFieldNames,
      );
    }

    const fieldsToRename: { field: FlatFieldMetadata; newName: string }[] = [];

    for (const {
      fieldName,
      objectUniversalIdentifier,
    } of NEW_STANDARD_FIELDS) {
      const conflictingField = allFlatFieldMetadatas.find(
        (flatFieldMetadata) =>
          flatFieldMetadata.objectMetadataUniversalIdentifier ===
            objectUniversalIdentifier && flatFieldMetadata.name === fieldName,
      );

      if (!isDefined(conflictingField)) {
        continue;
      }

      if (!conflictingField.isCustom) {
        this.logger.warn(
          `Non-custom field named "${fieldName}" exists on object ${objectUniversalIdentifier} for workspace ${workspaceId}; skipping rename`,
        );

        continue;
      }

      const takenFieldNames =
        takenFieldNamesByObject.get(objectUniversalIdentifier) ??
        new Set<string>();
      const newName = computeAvailableFieldName(fieldName, takenFieldNames);

      takenFieldNames.add(newName);
      fieldsToRename.push({ field: conflictingField, newName });
    }

    if (fieldsToRename.length === 0) {
      this.logger.log(
        `No custom fields conflict with the new standard field names for workspace ${workspaceId}`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Renaming ${fieldsToRename.length} conflicting custom field(s) for workspace ${workspaceId}: ${fieldsToRename
        .map(({ field, newName }) => `${field.name} -> ${newName}`)
        .join(', ')}`,
    );

    if (isDryRun) {
      return;
    }

    const fieldsToRenameByApplication = fieldsToRename.reduce<
      Map<string, typeof fieldsToRename>
    >((fieldsByApplication, fieldToRename) => {
      const applicationUniversalIdentifier =
        fieldToRename.field.applicationUniversalIdentifier;
      const fieldsForApplication =
        fieldsByApplication.get(applicationUniversalIdentifier) ?? [];

      fieldsForApplication.push(fieldToRename);
      fieldsByApplication.set(
        applicationUniversalIdentifier,
        fieldsForApplication,
      );

      return fieldsByApplication;
    }, new Map());

    for (const [
      applicationUniversalIdentifier,
      fieldsForApplication,
    ] of fieldsToRenameByApplication) {
      const flatEntityToUpdate = fieldsForApplication.map(
        ({ field, newName }) => ({
          ...field,
          name: newName,
          label: `${field.label} (custom)`,
          isLabelSyncedWithName: false,
        }),
      );

      const validateAndBuildResult =
        await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
          {
            allFlatEntityOperationByMetadataName: {
              fieldMetadata: {
                flatEntityToCreate: [],
                flatEntityToDelete: [],
                flatEntityToUpdate,
              },
            },
            workspaceId,
            isSystemBuild: true,
            applicationUniversalIdentifier,
          },
        );

      if (validateAndBuildResult.status === 'fail') {
        this.logger.error(
          `Failed to rename conflicting custom fields:\n${JSON.stringify(validateAndBuildResult, null, 2)}`,
        );

        throw new Error(
          `Failed to rename conflicting custom fields for workspace ${workspaceId}`,
        );
      }
    }

    this.logger.log(
      `Renamed ${fieldsToRename.length} conflicting custom field(s) for workspace ${workspaceId}`,
    );
  }
}

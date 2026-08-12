import { Command } from 'nest-commander';
import { LABEL_IDENTIFIER_FORMULA_FIELD_METADATA_TYPES } from 'twenty-shared/constants';
import {
  type FieldMetadataSettingsMapping,
  FieldMetadataType,
  type LabelIdentifierFormula,
  RelationType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RecordLabelFormulaService } from 'src/engine/core-modules/record-label-formula/services/record-label-formula.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

type ProgramObjectFormulaConfiguration = {
  objectNameSingular: string;
  template: string;
  fieldReferenceNames: string[][];
};

const PROGRAM_OBJECT_FORMULA_CONFIGURATIONS: ProgramObjectFormulaConfiguration[] =
  [
    {
      objectNameSingular: 'fellowship',
      template: '{0} - {1}',
      fieldReferenceNames: [['cohort'], ['fellow']],
    },
    {
      objectNameSingular: 'mentorship',
      template: '{0} - {1} <-> {2}',
      fieldReferenceNames: [['cohort'], ['mentor'], ['mentee']],
    },
    {
      objectNameSingular: 'recruitment',
      template: '{0} - {1} - {2}',
      fieldReferenceNames: [['cohort'], ['recruitmentRole'], ['person']],
    },
    {
      objectNameSingular: 'jobCandidacy',
      template: '{0} - {1}',
      fieldReferenceNames: [['candidate'], ['roleTitle']],
    },
    {
      objectNameSingular: 'fundraisingOpportunity',
      template: '{0} - {1}',
      fieldReferenceNames: [
        ['fundingInitiative'],
        ['funderOrganization', 'funderContact'],
      ],
    },
  ];

const SUPPORTED_FIELD_METADATA_TYPES = new Set<FieldMetadataType>(
  LABEL_IDENTIFIER_FORMULA_FIELD_METADATA_TYPES,
);

@RegisteredWorkspaceCommand('2.32.0', 1787000000000)
@Command({
  name: 'upgrade:2-32:enable-program-object-record-label-formulas',
  description:
    'Enable computed record labels for the program management custom objects when their expected fields exist',
})
export class EnableProgramObjectRecordLabelFormulasCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly recordLabelFormulaService: RecordLabelFormulaService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;
    const { flatFieldMetadataMaps, flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
        'flatObjectMetadataMaps',
      ]);
    const flatObjectMetadatas = Object.values(
      flatObjectMetadataMaps.byUniversalIdentifier,
    ).filter(isDefined);
    const flatFieldMetadatas = Object.values(
      flatFieldMetadataMaps.byUniversalIdentifier,
    ).filter(isDefined);
    const updatedLabelFieldMetadatas: FlatFieldMetadata[] = [];
    const labelFieldUniversalIdentifiersToBackfill = new Set<string>();

    for (const configuration of PROGRAM_OBJECT_FORMULA_CONFIGURATIONS) {
      const objectMetadata = flatObjectMetadatas.find(
        ({ nameSingular }) =>
          nameSingular === configuration.objectNameSingular,
      );

      if (!isDefined(objectMetadata)) {
        this.logger.log(
          `Object ${configuration.objectNameSingular} does not exist for workspace ${workspaceId}, skipping`,
        );
        continue;
      }

      const objectFields = flatFieldMetadatas.filter(
        ({ objectMetadataId }) => objectMetadataId === objectMetadata.id,
      );
      const labelFieldMetadata = objectFields.find(
        ({ id }) => id === objectMetadata.labelIdentifierFieldMetadataId,
      );

      if (
        !isDefined(labelFieldMetadata) ||
        labelFieldMetadata.type !== FieldMetadataType.TEXT
      ) {
        this.logger.warn(
          `Object ${configuration.objectNameSingular} does not have a text record label field, skipping`,
        );
        continue;
      }

      const formula = this.buildFormula(configuration, objectFields);

      if (!isDefined(formula)) {
        this.logger.warn(
          `Object ${configuration.objectNameSingular} is missing an expected supported formula field, skipping`,
        );
        continue;
      }

      const currentSettings = labelFieldMetadata.settings as
        | FieldMetadataSettingsMapping[FieldMetadataType.TEXT]
        | null;

      if (!isDefined(currentSettings?.labelIdentifierFormula)) {
        updatedLabelFieldMetadatas.push({
          ...labelFieldMetadata,
          settings: {
            ...(currentSettings ?? {}),
            labelIdentifierFormula: formula,
          },
          updatedAt: new Date().toISOString(),
        });
      }

      labelFieldUniversalIdentifiersToBackfill.add(
        labelFieldMetadata.universalIdentifier,
      );
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Found ${updatedLabelFieldMetadatas.length} program object record label formula(s) to enable for workspace ${workspaceId}`,
    );

    if (isDryRun) {
      return;
    }

    if (updatedLabelFieldMetadatas.length > 0) {
      const { workspaceCustomFlatApplication } =
        await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
          { workspaceId },
        );
      const validateAndBuildResult =
        await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
          {
            isSystemBuild: true,
            applicationUniversalIdentifier:
              workspaceCustomFlatApplication.universalIdentifier,
            workspaceId,
            allFlatEntityOperationByMetadataName: {
              fieldMetadata: {
                flatEntityToCreate: [],
                flatEntityToDelete: [],
                flatEntityToUpdate: updatedLabelFieldMetadatas,
              },
            },
          },
        );

      if (validateAndBuildResult.status === 'fail') {
        throw new Error(
          `Failed to enable program object record label formulas for workspace ${workspaceId}: ${JSON.stringify(
            validateAndBuildResult,
            null,
            2,
          )}`,
        );
      }
    }

    for (const fieldMetadataUniversalIdentifier of
      labelFieldUniversalIdentifiersToBackfill) {
      await this.recordLabelFormulaService.recomputeForFieldMetadataChange({
        fieldMetadataUniversalIdentifier,
        workspaceId,
      });
    }

    this.logger.log(
      `Enabled and backfilled program object record label formulas for workspace ${workspaceId}`,
    );
  }

  private buildFormula(
    configuration: ProgramObjectFormulaConfiguration,
    objectFields: FlatFieldMetadata[],
  ): LabelIdentifierFormula | undefined {
    const fieldReferences = configuration.fieldReferenceNames.map(
      (fallbackFieldNames) => {
        const fallbackFields = fallbackFieldNames.map((fieldName) =>
          objectFields.find(
            (fieldMetadata) =>
              fieldMetadata.name === fieldName &&
              fieldMetadata.isActive &&
              this.isSupportedFormulaField(fieldMetadata),
          ),
        );

        return fallbackFields.every(isDefined)
          ? {
              fieldMetadataUniversalIdentifiers: fallbackFields.map(
                (fieldMetadata) => fieldMetadata.universalIdentifier,
              ),
            }
          : undefined;
      },
    );

    if (!fieldReferences.every(isDefined)) {
      return undefined;
    }

    return {
      template: configuration.template,
      fieldReferences,
    };
  }

  private isSupportedFormulaField(fieldMetadata: FlatFieldMetadata): boolean {
    if (!SUPPORTED_FIELD_METADATA_TYPES.has(fieldMetadata.type)) {
      return false;
    }

    if (fieldMetadata.type !== FieldMetadataType.RELATION) {
      return true;
    }

    const relationSettings = fieldMetadata.settings as
      | FieldMetadataSettingsMapping[FieldMetadataType.RELATION]
      | null;

    return relationSettings?.relationType === RelationType.MANY_TO_ONE;
  }
}

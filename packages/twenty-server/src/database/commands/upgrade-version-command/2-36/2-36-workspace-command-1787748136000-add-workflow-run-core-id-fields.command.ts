import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const WORKFLOW_RUN = STANDARD_OBJECTS.workflowRun;
const CORE_ID_FIELD_UNIVERSAL_IDENTIFIERS = [
  WORKFLOW_RUN.fields.coreWorkflowId.universalIdentifier,
  WORKFLOW_RUN.fields.coreWorkflowVersionId.universalIdentifier,
];

@RegisteredWorkspaceCommand('2.36.0', 1787748136000)
@Command({
  name: 'upgrade:2-36:add-workflow-run-core-id-fields',
  description:
    'Add the workflowRun.coreWorkflowId and workflowRun.coreWorkflowVersionId system fields on existing workspaces that predate them',
})
export class AddWorkflowRunCoreIdFieldsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
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

    const { flatFieldMetadataMaps, flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
        'flatObjectMetadataMaps',
      ]);

    const workflowRunObjectMetadata =
      findFlatEntityByUniversalIdentifier<FlatObjectMetadata>({
        flatEntityMaps: flatObjectMetadataMaps,
        universalIdentifier: WORKFLOW_RUN.universalIdentifier,
      });

    if (!isDefined(workflowRunObjectMetadata)) {
      this.logger.log(
        `workflowRun object does not exist for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const missingFieldUniversalIdentifiers =
      CORE_ID_FIELD_UNIVERSAL_IDENTIFIERS.filter(
        (universalIdentifier) =>
          !isDefined(
            flatFieldMetadataMaps.byUniversalIdentifier[universalIdentifier],
          ),
      );

    if (missingFieldUniversalIdentifiers.length === 0) {
      return;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const { allFlatEntityMaps: standardAllFlatEntityMaps } =
      computeTwentyStandardApplicationAllFlatEntityMaps({
        now: new Date().toISOString(),
        workspaceId,
        twentyStandardApplicationId: twentyStandardFlatApplication.id,
      });

    const flatFieldMetadataToCreate = missingFieldUniversalIdentifiers.map(
      (universalIdentifier) => {
        const standardField =
          findFlatEntityByUniversalIdentifier<FlatFieldMetadata>({
            flatEntityMaps: standardAllFlatEntityMaps.flatFieldMetadataMaps,
            universalIdentifier,
          });

        if (!isDefined(standardField)) {
          throw new Error(
            `Standard application is missing workflowRun field ${universalIdentifier}`,
          );
        }

        return {
          ...standardField,
          viewFieldIds: [],
          viewFieldUniversalIdentifiers: [],
        };
      },
    );

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Would add ${flatFieldMetadataToCreate.length} workflowRun core id field(s) for workspace ${workspaceId}`,
      );

      return;
    }

    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          isSystemBuild: true,
          workspaceId,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
          allFlatEntityOperationByMetadataName: {
            fieldMetadata: {
              flatEntityToCreate: flatFieldMetadataToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
          },
        },
      );

    if (result.status === 'fail') {
      this.logger.error(
        `Failed to add workflowRun core id fields:\n${JSON.stringify(result, null, 2)}`,
      );

      throw new Error(
        `Failed to add workflowRun core id fields for workspace ${workspaceId}`,
      );
    }

    this.logger.log(
      `Added ${flatFieldMetadataToCreate.length} workflowRun core id field(s) for workspace ${workspaceId}`,
    );
  }
}

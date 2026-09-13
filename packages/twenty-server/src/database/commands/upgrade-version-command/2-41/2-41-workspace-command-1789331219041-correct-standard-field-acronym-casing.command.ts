import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

// The label a standard field is created with is the English string itself, and
// the standard application is synchronized only when a workspace is created, so
// correcting the source leaves every existing workspace on the old text.
//
// Frozen as a literal rather than derived from the current standard metadata: a
// later label change must not be dragged in by this command years afterwards.
const CORRECTED_TEXT_BY_PREVIOUS_TEXT: Record<string, string> = {
  'Associated User Id': 'Associated User ID',
  'Avatar Url': 'Avatar URL',
  'Header message Id': 'Header message ID',
  Id: 'ID',
  'Json object to provide steps': 'JSON object to provide steps',
  'Json object to provide trigger': 'JSON object to provide trigger',
  'Json value for event details': 'JSON value for event details',
  'Last published Version Id': 'Last published Version ID',
  'Linked Object Metadata Id': 'Linked Object Metadata ID',
  'Message Channel Id': 'Message Channel ID',
  'Message External Id': 'Message External ID',
  'Message Id': 'Message ID',
  'Message Thread Id': 'Message Thread ID',
  'Thread External Id': 'Thread External ID',
  'User Id': 'User ID',
};

function correctIfUntouched(text: string): string;
function correctIfUntouched(text: string | null): string | null;
function correctIfUntouched(text: string | null): string | null {
  return isDefined(text)
    ? (CORRECTED_TEXT_BY_PREVIOUS_TEXT[text] ?? text)
    : text;
}

@RegisteredWorkspaceCommand('2.41.0', 1789331219041)
@Command({
  name: 'upgrade:2-41:correct-standard-field-acronym-casing',
  description:
    'Rewrite the standard field labels and descriptions that spell ID, URL and JSON as Id, Url and Json',
})
export class CorrectStandardFieldAcronymCasingCommand extends ProvisionedWorkspaceCommandRunner {
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

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const { flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
      ]);

    const flatFieldMetadatasToUpdate = Object.values(
      flatFieldMetadataMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      // A custom field someone named "Id" is theirs, not the catalog's.
      .filter(
        (flatFieldMetadata) =>
          flatFieldMetadata.applicationId === twentyStandardFlatApplication.id,
      )
      .reduce<FlatFieldMetadata[]>((accumulator, flatFieldMetadata) => {
        const label = correctIfUntouched(flatFieldMetadata.label);
        const description = correctIfUntouched(flatFieldMetadata.description);

        if (
          label === flatFieldMetadata.label &&
          description === flatFieldMetadata.description
        ) {
          return accumulator;
        }

        accumulator.push({ ...flatFieldMetadata, label, description });

        return accumulator;
      }, []);

    if (flatFieldMetadatasToUpdate.length === 0) {
      this.logger.log(
        `No miscased standard field labels for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: correcting ${flatFieldMetadatasToUpdate.length} standard field label(s)`,
    );

    if (isDryRun) {
      return;
    }

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            fieldMetadata: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: flatFieldMetadatasToUpdate,
            },
          },
          workspaceId,
          isSystemBuild: true,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      this.logger.error(
        `Failed to correct standard field labels:\n${JSON.stringify(validateAndBuildResult, null, 2)}`,
      );

      throw new Error(
        `Failed to correct standard field labels for workspace ${workspaceId}`,
      );
    }

    this.logger.log(
      `Successfully corrected standard field labels for workspace ${workspaceId}`,
    );
  }
}

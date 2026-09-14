import { Command } from 'nest-commander';
import {
  MetadataReadability,
  type ObjectAccessInheritance,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { STANDARD_CHILD_OBJECT_INHERITANCES } from 'src/database/commands/upgrade-version-command/2-41/standard-child-object-inheritances.constant';
import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const STANDARD_INHERITANCE_BY_UNIVERSAL_IDENTIFIER = new Map<
  string,
  ObjectAccessInheritance
>(
  STANDARD_CHILD_OBJECT_INHERITANCES.map((entry) => [
    entry.universalIdentifier,
    entry.inheritance,
  ]),
);

@RegisteredWorkspaceCommand('2.41.0', 1789343528002)
@Command({
  name: 'upgrade:2-41:migrate-standard-child-objects-to-inherited-access',
  description:
    'Declare the canonical inherited access of the attachment, timelineActivity, noteTarget, taskTarget, messageThreadTarget and calendarEventTarget standard objects',
})
export class MigrateStandardChildObjectsToInheritedAccessCommand extends ProvisionedWorkspaceCommandRunner {
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

    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
      ]);

    const flatObjectMetadatasToUpdate: FlatObjectMetadata[] = [];
    const unresolvedObjectNames: string[] = [];

    for (const flatObjectMetadata of Object.values(
      flatObjectMetadataMaps.byUniversalIdentifier,
    )) {
      if (!isDefined(flatObjectMetadata)) {
        continue;
      }

      const targetInheritance = this.resolveTargetInheritance({
        flatObjectMetadata,
      });

      if (targetInheritance === 'unresolved') {
        unresolvedObjectNames.push(flatObjectMetadata.nameSingular);
        continue;
      }

      if (!isDefined(targetInheritance)) {
        continue;
      }

      flatObjectMetadatasToUpdate.push({
        ...flatObjectMetadata,
        readability: MetadataReadability.INHERITED,
        inheritance: targetInheritance,
        updatedAt: new Date().toISOString(),
      });
    }

    if (unresolvedObjectNames.length > 0) {
      throw new Error(
        `Cannot migrate the inherited access of workspace ${workspaceId}: ${unresolvedObjectNames.join(
          ', ',
        )} declare INHERITED readability without a usable parent relation. Declare their inheritance parameters or set another readability before upgrading.`,
      );
    }

    if (flatObjectMetadatasToUpdate.length === 0) {
      this.logger.log(
        `Inherited access is already canonical for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const objectNames = flatObjectMetadatasToUpdate
      .map((flatObjectMetadata) => flatObjectMetadata.nameSingular)
      .join(', ');

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Declaring inherited access on ${objectNames} for workspace ${workspaceId}`,
    );

    if (isDryRun) {
      return;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          isSystemBuild: true,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
          workspaceId,
          allFlatEntityOperationByMetadataName: {
            objectMetadata: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: flatObjectMetadatasToUpdate,
            },
          },
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new Error(
        `Failed to declare inherited access on ${objectNames} for workspace ${workspaceId}: ${JSON.stringify(
          validateAndBuildResult,
          null,
          2,
        )}`,
      );
    }

    this.logger.log(
      `Declared inherited access on ${objectNames} for workspace ${workspaceId}`,
    );
  }

  private resolveTargetInheritance({
    flatObjectMetadata,
  }: {
    flatObjectMetadata: FlatObjectMetadata;
  }): ObjectAccessInheritance | 'unresolved' | undefined {
    const standardInheritance =
      STANDARD_INHERITANCE_BY_UNIVERSAL_IDENTIFIER.get(
        flatObjectMetadata.universalIdentifier,
      );

    if (isDefined(standardInheritance)) {
      return this.isSameInheritance(
        flatObjectMetadata.inheritance,
        standardInheritance,
      ) && flatObjectMetadata.readability === MetadataReadability.INHERITED
        ? undefined
        : standardInheritance;
    }

    if (flatObjectMetadata.readability !== MetadataReadability.INHERITED) {
      return undefined;
    }

    const inheritance = flatObjectMetadata.inheritance;

    return isDefined(inheritance) && inheritance.through.length > 0
      ? undefined
      : 'unresolved';
  }

  private isSameInheritance(
    left: ObjectAccessInheritance | null | undefined,
    right: ObjectAccessInheritance,
  ): boolean {
    return isDefined(left) && JSON.stringify(left) === JSON.stringify(right);
  }
}

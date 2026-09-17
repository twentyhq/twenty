import { Command } from 'nest-commander';
import { STANDARD_OBJECT_FIELDS, STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { MetadataReadability } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

export const STANDARD_OBJECTS_TO_INHERIT_THROUGH_TARGETS = [
  {
    nameSingular: 'note',
    universalIdentifier: STANDARD_OBJECTS.note.universalIdentifier,
    readabilityParentFieldUniversalIdentifiers: [
      STANDARD_OBJECT_FIELDS.note.noteTargets.universalIdentifier,
    ],
  },
  {
    nameSingular: 'noteTarget',
    universalIdentifier: STANDARD_OBJECTS.noteTarget.universalIdentifier,
    readabilityParentFieldUniversalIdentifiers: [
      STANDARD_OBJECT_FIELDS.noteTarget.targetPerson.universalIdentifier,
    ],
  },
  {
    nameSingular: 'task',
    universalIdentifier: STANDARD_OBJECTS.task.universalIdentifier,
    readabilityParentFieldUniversalIdentifiers: [
      STANDARD_OBJECT_FIELDS.task.taskTargets.universalIdentifier,
    ],
  },
  {
    nameSingular: 'taskTarget',
    universalIdentifier: STANDARD_OBJECTS.taskTarget.universalIdentifier,
    readabilityParentFieldUniversalIdentifiers: [
      STANDARD_OBJECT_FIELDS.taskTarget.targetPerson.universalIdentifier,
    ],
  },
] as const;

const hasSameParentFields = (
  flatObjectMetadata: FlatObjectMetadata,
  readabilityParentFieldUniversalIdentifiers: readonly string[],
): boolean => {
  const current = flatObjectMetadata.readabilityParentFieldUniversalIdentifiers;

  return (
    isDefined(current) &&
    current.length === readabilityParentFieldUniversalIdentifiers.length &&
    readabilityParentFieldUniversalIdentifiers.every((universalIdentifier) =>
      current.includes(universalIdentifier),
    )
  );
};

@RegisteredWorkspaceCommand('2.41.0', 1789373200002)
@Command({
  name: 'upgrade:2-41:make-notes-and-tasks-inherit-their-targets',
  description:
    'Set the readability of the existing note and task standard objects to INHERITED through their note targets and task targets, and point the existing noteTarget and taskTarget objects at their targets instead of the note or task, as the standard application now declares them; workspaces created after the change already have it',
})
export class MakeNotesAndTasksInheritTheirTargetsCommand extends ProvisionedWorkspaceCommandRunner {
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

    for (const {
      nameSingular,
      universalIdentifier,
      readabilityParentFieldUniversalIdentifiers,
    } of STANDARD_OBJECTS_TO_INHERIT_THROUGH_TARGETS) {
      const flatObjectMetadata =
        findFlatEntityByUniversalIdentifier<FlatObjectMetadata>({
          flatEntityMaps: flatObjectMetadataMaps,
          universalIdentifier,
        });

      if (!isDefined(flatObjectMetadata)) {
        this.logger.warn(
          `${nameSingular} object not found for workspace ${workspaceId}, skipping it`,
        );

        continue;
      }

      if (
        flatObjectMetadata.readability === MetadataReadability.INHERITED &&
        hasSameParentFields(
          flatObjectMetadata,
          readabilityParentFieldUniversalIdentifiers,
        )
      ) {
        continue;
      }

      flatObjectMetadatasToUpdate.push({
        ...flatObjectMetadata,
        readability: MetadataReadability.INHERITED,
        readabilityParentFieldUniversalIdentifiers: [
          ...readabilityParentFieldUniversalIdentifiers,
        ],
        updatedAt: new Date().toISOString(),
      });
    }

    if (flatObjectMetadatasToUpdate.length === 0) {
      this.logger.log(
        `Notes and tasks already inherit through their targets for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const objectNames = flatObjectMetadatasToUpdate
      .map((flatObjectMetadata) => flatObjectMetadata.nameSingular)
      .join(', ');

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Making ${objectNames} inherit through their targets for workspace ${workspaceId}`,
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
        `Failed to make ${objectNames} inherit through their targets for workspace ${workspaceId}: ${JSON.stringify(
          validateAndBuildResult,
          null,
          2,
        )}`,
      );
    }

    this.logger.log(
      `Made ${objectNames} inherit through their targets for workspace ${workspaceId}`,
    );
  }
}

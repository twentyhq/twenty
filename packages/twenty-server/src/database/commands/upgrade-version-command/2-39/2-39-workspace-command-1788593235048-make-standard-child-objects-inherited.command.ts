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

export const STANDARD_CHILD_OBJECTS_TO_MAKE_INHERITED = [
  {
    nameSingular: 'attachment',
    universalIdentifier: STANDARD_OBJECTS.attachment.universalIdentifier,
    readabilityParentFieldUniversalIdentifiers: [
      STANDARD_OBJECT_FIELDS.attachment.targetNote.universalIdentifier,
    ],
  },
  {
    nameSingular: 'timelineActivity',
    universalIdentifier: STANDARD_OBJECTS.timelineActivity.universalIdentifier,
    readabilityParentFieldUniversalIdentifiers: [
      STANDARD_OBJECT_FIELDS.timelineActivity.targetPerson.universalIdentifier,
    ],
  },
  {
    nameSingular: 'noteTarget',
    universalIdentifier: STANDARD_OBJECTS.noteTarget.universalIdentifier,
    readabilityParentFieldUniversalIdentifiers: [
      STANDARD_OBJECT_FIELDS.noteTarget.note.universalIdentifier,
    ],
  },
  {
    nameSingular: 'taskTarget',
    universalIdentifier: STANDARD_OBJECTS.taskTarget.universalIdentifier,
    readabilityParentFieldUniversalIdentifiers: [
      STANDARD_OBJECT_FIELDS.taskTarget.task.universalIdentifier,
    ],
  },
  {
    nameSingular: 'messageThreadTarget',
    universalIdentifier:
      STANDARD_OBJECTS.messageThreadTarget.universalIdentifier,
    readabilityParentFieldUniversalIdentifiers: [
      STANDARD_OBJECT_FIELDS.messageThreadTarget.messageThread
        .universalIdentifier,
    ],
  },
  {
    nameSingular: 'calendarEventTarget',
    universalIdentifier:
      STANDARD_OBJECTS.calendarEventTarget.universalIdentifier,
    readabilityParentFieldUniversalIdentifiers: [
      STANDARD_OBJECT_FIELDS.calendarEventTarget.calendarEvent
        .universalIdentifier,
    ],
  },
] as const;

@RegisteredWorkspaceCommand('2.39.0', 1788593235048)
@Command({
  name: 'upgrade:2-39:make-standard-child-objects-inherited',
  description:
    'Set the readability of the existing attachment, timelineActivity, noteTarget, taskTarget, messageThreadTarget and calendarEventTarget standard objects to INHERITED with their parent fields, as the standard application now declares them; workspaces created after the change already have it',
})
export class MakeStandardChildObjectsInheritedCommand extends ProvisionedWorkspaceCommandRunner {
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
    } of STANDARD_CHILD_OBJECTS_TO_MAKE_INHERITED) {
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

      if (flatObjectMetadata.readability === MetadataReadability.INHERITED) {
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
        `Standard child objects are already INHERITED for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const objectNames = flatObjectMetadatasToUpdate
      .map((flatObjectMetadata) => flatObjectMetadata.nameSingular)
      .join(', ');

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Making ${objectNames} INHERITED for workspace ${workspaceId}`,
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
        `Failed to make ${objectNames} INHERITED for workspace ${workspaceId}: ${JSON.stringify(
          validateAndBuildResult,
          null,
          2,
        )}`,
      );
    }

    this.logger.log(
      `Made ${objectNames} INHERITED for workspace ${workspaceId}`,
    );
  }
}

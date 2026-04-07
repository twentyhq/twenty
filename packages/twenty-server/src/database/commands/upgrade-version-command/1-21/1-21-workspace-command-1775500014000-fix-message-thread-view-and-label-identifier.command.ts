import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';
import { type UniversalFlatViewField } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-field.type';

const MESSAGE_THREAD_OBJECT_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.messageThread.universalIdentifier;
const MESSAGE_THREAD_SUBJECT_FIELD_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.messageThread.fields.subject.universalIdentifier;
const ALL_MESSAGE_THREADS_VIEW_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.messageThread.views.allMessageThreads.universalIdentifier;

type WorkspaceFlatEntityMaps = Awaited<
  ReturnType<WorkspaceCacheService['getOrRecompute']>
>;
type FlatViewFieldMaps = WorkspaceFlatEntityMaps['flatViewFieldMaps'];
type FlatFieldMetadataMaps = WorkspaceFlatEntityMaps['flatFieldMetadataMaps'];

const filterViewFieldsByViewUniversalIdentifier = ({
  flatViewFieldMaps,
  viewUniversalIdentifier,
}: {
  flatViewFieldMaps: FlatViewFieldMaps;
  viewUniversalIdentifier: string;
}): UniversalFlatViewField[] =>
  Object.values(flatViewFieldMaps.byUniversalIdentifier)
    .filter(isDefined)
    .filter(
      (viewField) =>
        viewField.viewUniversalIdentifier === viewUniversalIdentifier,
    );

@RegisteredWorkspaceCommand('1.21.0', 1775500014000)
@Command({
  name: 'upgrade:1-21:fix-message-thread-view-and-label-identifier',
  description:
    'Sync the allMessageThreads standard view fields with the current standard definition (adds subject and updatedAt columns) and repoint messageThread.labelIdentifierFieldMetadataId to the subject field. Fixes workspaces upgraded from <1.21 where PR #19351 changes were not applied because the twenty-standard application is not re-synced on existing workspaces.',
})
export class FixMessageThreadViewAndLabelIdentifierCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
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

    const { allFlatEntityMaps: standardAllFlatEntityMaps } =
      computeTwentyStandardApplicationAllFlatEntityMaps({
        now: new Date().toISOString(),
        workspaceId,
        twentyStandardApplicationId: twentyStandardFlatApplication.id,
      });

    const {
      flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
      flatFieldMetadataMaps: existingFlatFieldMetadataMaps,
      flatViewFieldMaps: existingFlatViewFieldMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatObjectMetadataMaps',
      'flatFieldMetadataMaps',
      'flatViewFieldMaps',
    ]);

    const existingMessageThreadObjectMetadata =
      findFlatEntityByUniversalIdentifier<FlatObjectMetadata>({
        flatEntityMaps: existingFlatObjectMetadataMaps,
        universalIdentifier: MESSAGE_THREAD_OBJECT_UNIVERSAL_IDENTIFIER,
      });

    if (!isDefined(existingMessageThreadObjectMetadata)) {
      this.logger.log(
        `messageThread object metadata not found for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const viewFieldsToDelete = this.computeMessageThreadViewFieldsToDelete({
      existingFlatViewFieldMaps,
    });

    const viewFieldsToCreate = this.computeMessageThreadViewFieldsToCreate({
      standardAllFlatEntityMaps,
      existingFlatFieldMetadataMaps,
    });

    const flatObjectMetadataToUpdate =
      this.computeMessageThreadObjectMetadataToUpdate({
        existingMessageThreadObjectMetadata,
        existingFlatFieldMetadataMaps,
      });

    const hasViewFieldChanges =
      viewFieldsToDelete.length > 0 || viewFieldsToCreate.length > 0;
    const hasObjectMetadataChange = isDefined(flatObjectMetadataToUpdate);

    if (!hasViewFieldChanges && !hasObjectMetadataChange) {
      this.logger.log(
        `Nothing to fix for messageThread in workspace ${workspaceId}`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Fixing messageThread in workspace ${workspaceId}: deleting ${viewFieldsToDelete.length} view fields, creating ${viewFieldsToCreate.length} view fields${hasObjectMetadataChange ? ', repointing labelIdentifierFieldMetadataId to subject' : ''}`,
    );

    if (isDryRun) {
      return;
    }

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            objectMetadata: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: hasObjectMetadataChange
                ? [flatObjectMetadataToUpdate]
                : [],
            },
            viewField: {
              flatEntityToCreate: viewFieldsToCreate,
              flatEntityToDelete: viewFieldsToDelete,
              flatEntityToUpdate: [],
            },
          },
          workspaceId,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      this.logger.error(
        `Failed to fix messageThread for workspace ${workspaceId}:\n${JSON.stringify(validateAndBuildResult, null, 2)}`,
      );

      throw new Error(
        `Failed to fix messageThread for workspace ${workspaceId}`,
      );
    }

    this.logger.log(
      `Successfully fixed messageThread for workspace ${workspaceId}`,
    );
  }

  // Delete every existing view field attached to the standard allMessageThreads view
  // so we can recreate them from the current standard definition in one diff.
  private computeMessageThreadViewFieldsToDelete({
    existingFlatViewFieldMaps,
  }: {
    existingFlatViewFieldMaps: FlatViewFieldMaps;
  }): UniversalFlatViewField[] {
    return filterViewFieldsByViewUniversalIdentifier({
      flatViewFieldMaps: existingFlatViewFieldMaps,
      viewUniversalIdentifier: ALL_MESSAGE_THREADS_VIEW_UNIVERSAL_IDENTIFIER,
    });
  }

  // Recreate view fields from the current standard definition, skipping any that
  // reference a field metadata that does not yet exist in this workspace (defensive
  // guard in case the 1-21 subject backfill command has not been run first).
  private computeMessageThreadViewFieldsToCreate({
    standardAllFlatEntityMaps,
    existingFlatFieldMetadataMaps,
  }: {
    standardAllFlatEntityMaps: ReturnType<
      typeof computeTwentyStandardApplicationAllFlatEntityMaps
    >['allFlatEntityMaps'];
    existingFlatFieldMetadataMaps: FlatFieldMetadataMaps;
  }): UniversalFlatViewField[] {
    return filterViewFieldsByViewUniversalIdentifier({
      flatViewFieldMaps: standardAllFlatEntityMaps.flatViewFieldMaps,
      viewUniversalIdentifier: ALL_MESSAGE_THREADS_VIEW_UNIVERSAL_IDENTIFIER,
    }).filter((viewField) =>
      isDefined(
        existingFlatFieldMetadataMaps.byUniversalIdentifier[
          viewField.fieldMetadataUniversalIdentifier
        ],
      ),
    );
  }

  // Build the "to" messageThread object metadata with its labelIdentifier repointed
  // to the subject field. Returns undefined if the subject field is missing (the
  // 1-21 subject backfill command must be run first) or if the pointer is already
  // correct, in which case we skip the update to avoid a no-op migration.
  private computeMessageThreadObjectMetadataToUpdate({
    existingMessageThreadObjectMetadata,
    existingFlatFieldMetadataMaps,
  }: {
    existingMessageThreadObjectMetadata: FlatObjectMetadata;
    existingFlatFieldMetadataMaps: FlatFieldMetadataMaps;
  }): UniversalFlatObjectMetadata | undefined {
    const existingSubjectField = findFlatEntityByUniversalIdentifier({
      flatEntityMaps: existingFlatFieldMetadataMaps,
      universalIdentifier: MESSAGE_THREAD_SUBJECT_FIELD_UNIVERSAL_IDENTIFIER,
    });

    if (!isDefined(existingSubjectField)) {
      this.logger.warn(
        `messageThread.subject field not found in workspace - run upgrade:1-21:backfill-message-thread-subject first`,
      );

      return undefined;
    }

    if (
      existingMessageThreadObjectMetadata.labelIdentifierFieldMetadataUniversalIdentifier ===
      MESSAGE_THREAD_SUBJECT_FIELD_UNIVERSAL_IDENTIFIER
    ) {
      return undefined;
    }

    return {
      ...existingMessageThreadObjectMetadata,
      labelIdentifierFieldMetadataUniversalIdentifier:
        MESSAGE_THREAD_SUBJECT_FIELD_UNIVERSAL_IDENTIFIER,
    };
  }
}

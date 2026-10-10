import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { capitalize, isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { getMetadataRelatedMetadataNames } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-related-metadata-names.util';
import { getMetadataSerializedRelationNames } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-serialized-relation-names.util';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/workspace-migration-runner.service';

const NOTE_TARGET = STANDARD_OBJECTS.noteTarget;
const TASK_TARGET = STANDARD_OBJECTS.taskTarget;

// Note and task target fields are each one morph relation rendered as a
// single column, which borrowed the label of whichever sibling survived
// dedup, so every sibling now carries the same label. Frozen as literals so a
// later label change is not dragged in by this command.
const PREVIOUS_STANDARD_LABEL_BY_FIELD_UNIVERSAL_IDENTIFIER: Record<
  string,
  string
> = {
  [NOTE_TARGET.fields.targetPerson.universalIdentifier]: 'Person',
  [NOTE_TARGET.fields.targetCompany.universalIdentifier]: 'Company',
  [NOTE_TARGET.fields.targetOpportunity.universalIdentifier]: 'Opportunity',
  [TASK_TARGET.fields.targetPerson.universalIdentifier]: 'Person',
  [TASK_TARGET.fields.targetCompany.universalIdentifier]: 'Company',
  [TASK_TARGET.fields.targetOpportunity.universalIdentifier]: 'Opportunity',
};

const LINKED_TO_LABEL = 'Linked to';

const getPreviousLabel = ({
  fieldMetadata,
  standardApplicationId,
}: {
  fieldMetadata: FieldMetadataEntity;
  standardApplicationId: string;
}): string | undefined => {
  if (fieldMetadata.applicationId === standardApplicationId) {
    return PREVIOUS_STANDARD_LABEL_BY_FIELD_UNIVERSAL_IDENTIFIER[
      fieldMetadata.universalIdentifier
    ];
  }

  if (!isDefined(fieldMetadata.relationTargetObjectMetadata)) {
    return undefined;
  }

  return capitalize(fieldMetadata.relationTargetObjectMetadata.nameSingular);
};

@RegisteredWorkspaceCommand('2.47.0', 1791605436340)
@Command({
  name: 'upgrade:2-47:relabel-note-and-task-target-fields',
  description:
    'Label every note and task target morph field "Linked to" so their tables no longer name the column after one of the targets',
})
export class RelabelNoteAndTaskTargetFieldsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceMigrationRunnerService: WorkspaceMigrationRunnerService,
    @InjectWorkspaceScopedRepository(FieldMetadataEntity)
    private readonly fieldMetadataRepository: WorkspaceScopedRepository<FieldMetadataEntity>,
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

    const fieldMetadatas = await this.fieldMetadataRepository.find(
      workspaceId,
      {
        where: {
          morphId: In([
            NOTE_TARGET.morphIds.targetMorphId.morphId,
            TASK_TARGET.morphIds.targetMorphId.morphId,
          ]),
        },
        relations: { relationTargetObjectMetadata: true },
      },
    );

    // A label someone already changed is theirs to keep. Siblings added for
    // custom objects were labelled after their object's singular name.
    const fieldMetadatasToRelabel = fieldMetadatas.filter((fieldMetadata) => {
      const previousLabel = getPreviousLabel({
        fieldMetadata,
        standardApplicationId: twentyStandardFlatApplication.id,
      });

      return isDefined(previousLabel) && fieldMetadata.label === previousLabel;
    });

    if (fieldMetadatasToRelabel.length === 0) {
      this.logger.log(
        `No note or task target field to relabel for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: relabelling ${fieldMetadatasToRelabel.length} note or task target field(s)`,
    );

    if (isDryRun) {
      return;
    }

    // A label carries no schema consequence, so the rows are written directly
    // rather than through a workspace migration, as the 2.43 attachment
    // relabel command does.
    await this.fieldMetadataRepository.update(
      workspaceId,
      {
        id: In(fieldMetadatasToRelabel.map(({ id }) => id)),
      },
      { label: LINKED_TO_LABEL },
    );

    const fieldMetadataRelatedNames = [
      'fieldMetadata',
      ...getMetadataRelatedMetadataNames('fieldMetadata'),
      ...getMetadataSerializedRelationNames('fieldMetadata'),
    ] as const;
    const allFlatEntityMapsKeys = [
      ...new Set(fieldMetadataRelatedNames.map(getMetadataFlatEntityMapsKey)),
    ];

    await this.workspaceMigrationRunnerService.invalidateCache({
      allFlatEntityMapsKeys,
      workspaceId,
    });

    this.logger.log(
      `Relabelled note and task target fields for workspace ${workspaceId}`,
    );
  }
}

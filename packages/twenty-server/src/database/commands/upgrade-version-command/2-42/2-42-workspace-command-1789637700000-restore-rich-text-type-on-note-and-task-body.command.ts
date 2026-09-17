import { InjectRepository } from '@nestjs/typeorm';
import { Command } from 'nest-commander';
import { STANDARD_OBJECT_FIELDS } from 'twenty-shared/metadata';
import { FieldMetadataType } from 'twenty-shared/types';
import { In, Repository } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { getMetadataRelatedMetadataNames } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-related-metadata-names.util';
import { getMetadataSerializedRelationNames } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-serialized-relation-names.util';
import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/workspace-migration-runner.service';

// Workspaces upgraded through 1.20 while the RICH_TEXT enum value was briefly 'RICH_TEXT' had their
// composite bodyV2 fields rewritten to TEXT by the 1.20 rich-text-to-text migration; the physical
// columns are still the composite pair, so the ORM has queried a "bodyV2" column that does not exist ever since.
const BODY_FIELD_UNIVERSAL_IDENTIFIERS = [
  STANDARD_OBJECT_FIELDS.note.bodyV2.universalIdentifier,
  STANDARD_OBJECT_FIELDS.task.bodyV2.universalIdentifier,
];

@RegisteredWorkspaceCommand('2.42.0', 1789637700000)
@Command({
  name: 'upgrade:2-42:restore-rich-text-type-on-note-and-task-body',
  description:
    'Restore the RICH_TEXT type on note and task bodyV2 fields that a 1.20 upgrade left as TEXT',
})
export class RestoreRichTextTypeOnNoteAndTaskBodyCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceMigrationRunnerService: WorkspaceMigrationRunnerService,
    @InjectRepository(FieldMetadataEntity)
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    const bodyFieldMetadatas = await this.fieldMetadataRepository.find({
      where: {
        workspaceId,
        universalIdentifier: In(BODY_FIELD_UNIVERSAL_IDENTIFIERS),
        type: FieldMetadataType.TEXT,
      },
    });

    if (bodyFieldMetadatas.length === 0) {
      this.logger.log(
        `No note or task body field typed TEXT for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: restoring RICH_TEXT on ${bodyFieldMetadatas.length} body field(s)`,
    );

    if (isDryRun) {
      return;
    }

    await this.fieldMetadataRepository.update(
      { id: In(bodyFieldMetadatas.map(({ id }) => id)), workspaceId },
      { type: FieldMetadataType.RICH_TEXT },
    );

    const fieldMetadataRelatedNames = [
      'fieldMetadata',
      ...getMetadataRelatedMetadataNames('fieldMetadata'),
      ...getMetadataSerializedRelationNames('fieldMetadata'),
    ] as const;

    await this.workspaceMigrationRunnerService.invalidateCache({
      allFlatEntityMapsKeys: [
        ...new Set(fieldMetadataRelatedNames.map(getMetadataFlatEntityMapsKey)),
      ],
      workspaceId,
    });

    this.logger.log(
      `Successfully restored RICH_TEXT on note and task body fields for workspace ${workspaceId}`,
    );
  }
}

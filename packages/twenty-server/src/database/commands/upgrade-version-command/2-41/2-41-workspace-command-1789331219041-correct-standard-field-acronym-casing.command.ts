import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { In, Repository } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { getMetadataRelatedMetadataNames } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-related-metadata-names.util';
import { getMetadataSerializedRelationNames } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-serialized-relation-names.util';
import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/workspace-migration-runner.service';

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

const PREVIOUS_TEXTS = Object.keys(CORRECTED_TEXT_BY_PREVIOUS_TEXT);

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

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    // Matching the exact previous string is what keeps a field someone renamed
    // out of this, and scoping to the standard application keeps a custom field
    // called Id out of it too.
    //
    // Every custom object gets a primary key labelled the same way, from a
    // different constant, and it belongs to that object's own application - so
    // it needs its own clause. Reserved name plus isSystem is what makes that
    // clause safe: neither is something a user can give a field of their own.
    const standardApplicationScope = {
      workspaceId,
      applicationId: twentyStandardFlatApplication.id,
    };
    const primaryKeyScope = {
      workspaceId,
      name: 'id',
      isSystem: true,
    };

    const fieldMetadatas = await this.fieldMetadataRepository.find({
      where: [
        { ...standardApplicationScope, label: In(PREVIOUS_TEXTS) },
        { ...standardApplicationScope, description: In(PREVIOUS_TEXTS) },
        { ...primaryKeyScope, label: In(PREVIOUS_TEXTS) },
        { ...primaryKeyScope, description: In(PREVIOUS_TEXTS) },
      ],
    });

    if (fieldMetadatas.length === 0) {
      this.logger.log(
        `No miscased standard field labels for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: correcting ${fieldMetadatas.length} standard field label(s)`,
    );

    if (isDryRun) {
      return;
    }

    // A label carries no schema consequence, so the rows are written directly
    // rather than through a workspace migration. The migration path revalidates
    // the whole entity, and a standard field such as workspaceMember.userId -
    // isNullable false with no default - cannot pass an update validation it
    // was never built to face, which failed the upgrade outright.
    for (const fieldMetadata of fieldMetadatas) {
      await this.fieldMetadataRepository.update(
        { id: fieldMetadata.id, workspaceId },
        {
          label: correctIfUntouched(fieldMetadata.label),
          description: correctIfUntouched(fieldMetadata.description),
        },
      );
    }

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
      `Successfully corrected standard field labels for workspace ${workspaceId}`,
    );
  }
}

import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';
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

const MESSAGE_CAMPAIGN_FIELDS = STANDARD_OBJECTS.messageCampaign.fields;

const LABELS_BY_COUNT_FIELD_UNIVERSAL_IDENTIFIER: Record<
  string,
  { countLabel: string; label: string }
> = {
  [MESSAGE_CAMPAIGN_FIELDS.sentCount.universalIdentifier]: {
    countLabel: 'Sent count',
    label: 'Sent',
  },
  [MESSAGE_CAMPAIGN_FIELDS.deliveredCount.universalIdentifier]: {
    countLabel: 'Delivered count',
    label: 'Delivered',
  },
  [MESSAGE_CAMPAIGN_FIELDS.failedCount.universalIdentifier]: {
    countLabel: 'Failed count',
    label: 'Failed',
  },
  [MESSAGE_CAMPAIGN_FIELDS.skippedCount.universalIdentifier]: {
    countLabel: 'Skipped count',
    label: 'Skipped',
  },
  [MESSAGE_CAMPAIGN_FIELDS.bouncedCount.universalIdentifier]: {
    countLabel: 'Bounced count',
    label: 'Bounced',
  },
  [MESSAGE_CAMPAIGN_FIELDS.complainedCount.universalIdentifier]: {
    countLabel: 'Complained count',
    label: 'Complaints',
  },
};

@RegisteredWorkspaceCommand('2.48.0', 1791972313415)
@Command({
  name: 'upgrade:2-48:relabel-message-campaign-count-fields',
  description:
    'Drop "count" from the campaign count field labels, so Sent count reads Sent and Complained count reads Complaints',
})
export class RelabelMessageCampaignCountFieldsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceMigrationRunnerService: WorkspaceMigrationRunnerService,
    @InjectWorkspaceScopedRepository(FieldMetadataEntity)
    private readonly fieldMetadataRepository: WorkspaceScopedRepository<FieldMetadataEntity>,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace(args: RunOnWorkspaceArgs): Promise<void> {
    await this.up(args);
  }

  async up(args: RunOnWorkspaceArgs): Promise<void> {
    await this.relabelCountFields(args, 'up');
  }

  async down(args: RunOnWorkspaceArgs): Promise<void> {
    await this.relabelCountFields(args, 'down');
  }

  private async relabelCountFields(
    { workspaceId, options }: RunOnWorkspaceArgs,
    direction: 'up' | 'down',
  ): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const fieldMetadatas = await this.fieldMetadataRepository.find(
      workspaceId,
      {
        where: {
          applicationId: twentyStandardFlatApplication.id,
          universalIdentifier: In(
            Object.keys(LABELS_BY_COUNT_FIELD_UNIVERSAL_IDENTIFIER),
          ),
        },
      },
    );

    const fieldMetadataRelabels = fieldMetadatas.flatMap((fieldMetadata) => {
      const labels =
        LABELS_BY_COUNT_FIELD_UNIVERSAL_IDENTIFIER[
          fieldMetadata.universalIdentifier
        ];

      if (!isDefined(labels)) {
        return [];
      }

      const [previousLabel, nextLabel] =
        direction === 'up'
          ? [labels.countLabel, labels.label]
          : [labels.label, labels.countLabel];

      return fieldMetadata.label === previousLabel
        ? [{ id: fieldMetadata.id, label: nextLabel }]
        : [];
    });

    if (fieldMetadataRelabels.length === 0) {
      this.logger.log(
        `No messageCampaign count field to relabel for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: relabelling ${fieldMetadataRelabels.length} messageCampaign count field(s)`,
    );

    if (isDryRun) {
      return;
    }

    for (const { id, label } of fieldMetadataRelabels) {
      await this.fieldMetadataRepository.update(workspaceId, { id }, { label });
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
      `Relabelled messageCampaign count fields for workspace ${workspaceId}`,
    );
  }
}

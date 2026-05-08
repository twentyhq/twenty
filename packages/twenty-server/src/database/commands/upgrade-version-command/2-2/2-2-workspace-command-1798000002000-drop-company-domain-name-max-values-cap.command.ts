import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

// Targeted UPDATE on the workspace's Company.domainName fieldMetadata row to
// drop settings.maxNumberOfValues so the LinksFieldInput renders multiple
// slots. The earlier 1798000001000 command tried to do this via
// synchronizeTwentyStandardApplicationOrThrow which was too heavy and tripped
// on pre-existing per-workspace metadata inconsistencies; this one bypasses
// that path entirely.
@RegisteredWorkspaceCommand('2.2.0', 1798000002000)
@Command({
  name: 'upgrade:2-2:drop-company-domain-name-max-values-cap',
  description:
    'Drop maxNumberOfValues:1 from Company.domainName field settings on existing workspaces.',
})
export class DropCompanyDomainNameMaxValuesCapCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    @InjectRepository(FieldMetadataEntity)
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    @InjectRepository(ObjectMetadataEntity)
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;
    const prefix = isDryRun ? '[DRY RUN] ' : '';

    const companyObjectMetadata = await this.objectMetadataRepository.findOne({
      where: { workspaceId, nameSingular: 'company' },
    });

    if (!isDefined(companyObjectMetadata)) {
      this.logger.warn(
        `${prefix}No Company object metadata found in workspace ${workspaceId} — skipping`,
      );

      return;
    }

    const fieldMetadata = await this.fieldMetadataRepository.findOne({
      where: {
        workspaceId,
        objectMetadataId: companyObjectMetadata.id,
        name: 'domainName',
      },
    });

    if (!isDefined(fieldMetadata)) {
      this.logger.warn(
        `${prefix}No Company.domainName field metadata in workspace ${workspaceId} — skipping`,
      );

      return;
    }

    const settings = (fieldMetadata.settings ?? {}) as Record<string, unknown>;

    if (!('maxNumberOfValues' in settings)) {
      this.logger.log(
        `${prefix}Company.domainName cap already lifted for workspace ${workspaceId}`,
      );

      return;
    }

    if (isDryRun) {
      this.logger.log(
        `${prefix}Would drop maxNumberOfValues cap on Company.domainName for workspace ${workspaceId}`,
      );

      return;
    }

    const { maxNumberOfValues: _droppedCap, ...remainingSettings } = settings;
    const newSettings =
      Object.keys(remainingSettings).length > 0 ? remainingSettings : null;

    await this.fieldMetadataRepository.update(fieldMetadata.id, {
      settings: newSettings as FieldMetadataEntity['settings'],
    });

    await this.workspaceCacheService.flush(workspaceId, [
      'flatFieldMetadataMaps',
    ]);

    this.logger.log(
      `Dropped maxNumberOfValues cap on Company.domainName for workspace ${workspaceId}`,
    );
  }
}

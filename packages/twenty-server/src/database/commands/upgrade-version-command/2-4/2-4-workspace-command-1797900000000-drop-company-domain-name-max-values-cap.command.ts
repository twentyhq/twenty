import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { FieldMetadataService } from 'src/engine/metadata-modules/field-metadata/services/field-metadata.service';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

// Use the public field-metadata API to override Company.domainName settings
// per workspace and drop the maxNumberOfValues cap. The standard definition
// in compute-company-standard-flat-field-metadata.util.ts keeps the cap (=
// upstream behaviour); this command applies the Stratum-specific override
// per-workspace via the same code path the GraphQL updateOneField mutation
// uses, so all migrations and cache invalidations happen correctly.
@RegisteredWorkspaceCommand('2.4.0', 1797900000000)
@Command({
  name: 'upgrade:2-4:drop-company-domain-name-max-values-cap',
  description:
    'Override Company.domainName settings on every workspace to drop the maxNumberOfValues cap so multiple domains can be added.',
})
export class DropCompanyDomainNameMaxValuesCapCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    @InjectRepository(FieldMetadataEntity)
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    @InjectRepository(ObjectMetadataEntity)
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    private readonly fieldMetadataService: FieldMetadataService,
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
        `${prefix}No Company object metadata in workspace ${workspaceId} — skipping`,
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
        `${prefix}No Company.domainName field in workspace ${workspaceId} — skipping`,
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

    await this.fieldMetadataService.updateOneField({
      workspaceId,
      isSystemBuild: true,
      updateFieldInput: {
        id: fieldMetadata.id,
        settings: newSettings,
      },
    });

    this.logger.log(
      `Dropped maxNumberOfValues cap on Company.domainName for workspace ${workspaceId}`,
    );
  }
}

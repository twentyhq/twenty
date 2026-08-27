import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { planCompanyDomainNameNormalization } from 'src/database/commands/upgrade-version-command/2-37/utils/plan-company-domain-name-normalization.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type CompanyWorkspaceEntity } from 'src/modules/company/standard-objects/company.workspace-entity';

@RegisteredWorkspaceCommand('2.37.0', 1787827221000)
@Command({
  name: 'upgrade:2-37:normalize-company-domain-names',
  description:
    'Rewrite company domain names to the bare canonical domain now written by the domain-typed LINKS field, so contact auto-creation matches them exactly',
})
export class NormalizeCompanyDomainNamesCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly workspaceCacheService: WorkspaceCacheService,
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

    const companyObject = findFlatEntityByUniversalIdentifier<FlatObjectMetadata>(
      {
        flatEntityMaps: flatObjectMetadataMaps,
        universalIdentifier: STANDARD_OBJECTS.company.universalIdentifier,
      },
    );

    if (!isDefined(companyObject)) {
      return;
    }

    const companyRepository =
      await this.workspaceOrmManager.getRepository<CompanyWorkspaceEntity>(
        'company',
        { shouldBypassPermissionChecks: true },
      );

    const companies = await companyRepository.find({
      select: { id: true, domainName: true },
      order: { id: 'ASC' },
      withDeleted: true,
    });

    const { updates, skippedCompanyIds } =
      planCompanyDomainNameNormalization(companies);

    if (updates.length === 0 && skippedCompanyIds.length === 0) {
      return;
    }

    if (!isDryRun) {
      for (const { id, domainName } of updates) {
        await companyRepository.update(id, { domainName });
      }
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Normalized ${updates.length} company domain name(s) for workspace ${workspaceId}`,
    );

    if (skippedCompanyIds.length > 0) {
      this.logger.warn(
        `Left ${skippedCompanyIds.length} company domain name(s) unnormalized in workspace ${workspaceId} because another company already holds the normalized domain, these need a merge: ${skippedCompanyIds.join(', ')}`,
      );
    }
  }
}

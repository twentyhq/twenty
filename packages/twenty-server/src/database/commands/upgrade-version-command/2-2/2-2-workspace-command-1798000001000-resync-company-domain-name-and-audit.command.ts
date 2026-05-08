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
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { CompanyWorkspaceEntity } from 'src/modules/company/standard-objects/company.workspace-entity';
import { getAllCompanyDomains } from 'src/modules/company/utils/get-all-company-domains.util';

@RegisteredWorkspaceCommand('2.2.0', 1798000001000)
@Command({
  name: 'upgrade:2-2:resync-company-domain-name-and-audit',
  description:
    'Drop the maxNumberOfValues:1 cap on Company.domainName for existing workspaces and report any pre-existing duplicate domains.',
})
export class ResyncCompanyDomainNameAndAuditCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
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

    try {
      await this.dropMaxNumberOfValuesCap({ workspaceId, isDryRun, prefix });
    } catch (error) {
      this.logger.warn(
        `${prefix}Failed to drop maxNumberOfValues cap on Company.domainName for workspace ${workspaceId}. ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }

    try {
      await this.auditDomainCollisions({ workspaceId, prefix });
    } catch (error) {
      this.logger.warn(
        `${prefix}Domain collision audit failed for workspace ${workspaceId}. ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  private async dropMaxNumberOfValuesCap({
    workspaceId,
    isDryRun,
    prefix,
  }: {
    workspaceId: string;
    isDryRun: boolean;
    prefix: string;
  }): Promise<void> {
    const companyObjectMetadata = await this.objectMetadataRepository.findOne({
      where: { workspaceId, nameSingular: 'company' },
    });

    if (!isDefined(companyObjectMetadata)) {
      this.logger.warn(
        `${prefix}No Company object metadata found in workspace ${workspaceId} — skipping cap removal`,
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
        `${prefix}No Company.domainName field metadata in workspace ${workspaceId} — skipping cap removal`,
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

  private async auditDomainCollisions({
    workspaceId,
    prefix,
  }: {
    workspaceId: string;
    prefix: string;
  }): Promise<void> {
    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const companyRepository =
        await this.globalWorkspaceOrmManager.getRepository(
          workspaceId,
          CompanyWorkspaceEntity,
          { shouldBypassPermissionChecks: true },
        );

      // Don't .select() specific columns: domainName is a composite LINKS
      // field that the query builder can't translate. Let TypeORM hydrate.
      const companies = await companyRepository
        .createQueryBuilder('company')
        .getMany();

      const ownersByDomain = new Map<string, string[]>();

      for (const company of companies) {
        for (const domain of getAllCompanyDomains(company.domainName)) {
          const owners = ownersByDomain.get(domain) ?? [];

          owners.push(company.id);
          ownersByDomain.set(domain, owners);
        }
      }

      let collisionCount = 0;

      for (const [domain, owners] of ownersByDomain.entries()) {
        if (owners.length > 1) {
          collisionCount += 1;
          this.logger.warn(
            `${prefix}Domain "${domain}" is shared by company ids [${owners.join(', ')}] in workspace ${workspaceId}. Resolve before further updates use the new uniqueness validator.`,
          );
        }
      }

      if (collisionCount === 0) {
        this.logger.log(
          `${prefix}No duplicate domains found in workspace ${workspaceId}`,
        );
      } else {
        this.logger.warn(
          `${prefix}${collisionCount} duplicate domain(s) detected in workspace ${workspaceId}`,
        );
      }
    }, authContext);
  }
}

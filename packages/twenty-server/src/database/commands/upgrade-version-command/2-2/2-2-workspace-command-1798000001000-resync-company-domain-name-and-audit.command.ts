import { Command } from 'nest-commander';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { TwentyStandardApplicationService } from 'src/engine/workspace-manager/twenty-standard-application/services/twenty-standard-application.service';
import { CompanyWorkspaceEntity } from 'src/modules/company/standard-objects/company.workspace-entity';
import { getAllCompanyDomains } from 'src/modules/company/utils/get-all-company-domains.util';

@RegisteredWorkspaceCommand('2.2.0', 1798000001000)
@Command({
  name: 'upgrade:2-2:resync-company-domain-name-and-audit',
  description:
    'Re-sync standard fields so the Company.domainName max-values cap is dropped, and report any pre-existing duplicate domains.',
})
export class ResyncCompanyDomainNameAndAuditCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly twentyStandardApplicationService: TwentyStandardApplicationService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;
    const prefix = isDryRun ? '[DRY RUN] ' : '';

    this.logger.log(
      `${prefix}Re-syncing Company.domainName field metadata for workspace ${workspaceId}`,
    );

    if (!isDryRun) {
      await this.twentyStandardApplicationService.synchronizeTwentyStandardApplicationOrThrow(
        { workspaceId },
      );
    }

    await this.auditDomainCollisions({ workspaceId, prefix });
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

      const companies = await companyRepository
        .createQueryBuilder('company')
        .select(['company.id', 'company.name', 'company.domainName'])
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

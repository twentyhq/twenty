import { Command } from 'nest-commander';
import { type LinksMetadata } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { buildCompanyDomainNameCandidatesQuery } from 'src/database/commands/upgrade-version-command/2-37/utils/build-company-domain-name-candidates-query.util';
import { buildCompanyDomainNameUpdateQuery } from 'src/database/commands/upgrade-version-command/2-37/utils/build-company-domain-name-update-query.util';
import {
  type CompanyDomainNameRewrite,
  computeCompanyDomainNameRewrites,
} from 'src/database/commands/upgrade-version-command/2-37/utils/compute-company-domain-name-rewrites.util';
import { partitionCompanyDomainNameRewrites } from 'src/database/commands/upgrade-version-command/2-37/utils/partition-company-domain-name-rewrites.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

const BACKFILL_BATCH_SIZE = 2000;
const FIRST_COMPANY_ID = '00000000-0000-0000-0000-000000000000';

type WorkspaceDataSource = NonNullable<RunOnWorkspaceArgs['dataSource']>;

@RegisteredWorkspaceCommand('2.37.0', 1787827221000)
@Command({
  name: 'upgrade:2-37:normalize-company-domain-names',
  description:
    'Rewrite company domain names to the bare canonical domain now written by the domain-typed LINKS field, so contact auto-creation matches them exactly',
})
export class NormalizeCompanyDomainNamesCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
    dataSource,
  }: RunOnWorkspaceArgs): Promise<void> {
    if (!isDefined(dataSource)) {
      return;
    }

    const isDryRun = options.dryRun ?? false;
    const schemaName = getWorkspaceSchemaName(workspaceId);

    let afterCompanyId = FIRST_COMPANY_ID;
    let updatedCount = 0;
    const skippedCompanyIds: string[] = [];

    for (;;) {
      const candidates = await this.findNextCandidates({
        dataSource,
        schemaName,
        afterCompanyId,
      });

      if (candidates.length === 0) {
        break;
      }

      afterCompanyId = candidates[candidates.length - 1].id;

      const rewrites = computeCompanyDomainNameRewrites(candidates);

      const { updates, skippedCompanyIds: skippedInBatch } =
        partitionCompanyDomainNameRewrites({
          rewrites,
          claimedPrimaryLinkUrls: await this.findClaimedPrimaryLinkUrls({
            dataSource,
            schemaName,
            rewrites,
          }),
        });

      skippedCompanyIds.push(...skippedInBatch);
      updatedCount += updates.length;

      if (updates.length > 0 && !isDryRun) {
        const updateQuery = buildCompanyDomainNameUpdateQuery({
          schemaName,
          updates,
        });

        await dataSource.query(updateQuery.sql, updateQuery.parameters);
      }

      if (candidates.length < BACKFILL_BATCH_SIZE) {
        break;
      }
    }

    if (updatedCount === 0 && skippedCompanyIds.length === 0) {
      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Normalized ${updatedCount} company domain name(s) for workspace ${workspaceId}`,
    );

    if (skippedCompanyIds.length > 0) {
      this.logger.warn(
        `Left ${skippedCompanyIds.length} company domain name(s) unnormalized in workspace ${workspaceId} because another company already holds the normalized domain, these need a merge: ${skippedCompanyIds.join(', ')}`,
      );
    }
  }

  private async findNextCandidates({
    dataSource,
    schemaName,
    afterCompanyId,
  }: {
    dataSource: WorkspaceDataSource;
    schemaName: string;
    afterCompanyId: string;
  }): Promise<{ id: string; domainName: LinksMetadata }[]> {
    const { sql, parameters } = buildCompanyDomainNameCandidatesQuery({
      schemaName,
      batchSize: BACKFILL_BATCH_SIZE,
      afterCompanyId,
    });

    const rows = await dataSource.query<({ id: string } & LinksMetadata)[]>(
      sql,
      parameters,
    );

    return rows.map(({ id, ...domainName }) => ({ id, domainName }));
  }

  private async findClaimedPrimaryLinkUrls({
    dataSource,
    schemaName,
    rewrites,
  }: {
    dataSource: WorkspaceDataSource;
    schemaName: string;
    rewrites: CompanyDomainNameRewrite[];
  }): Promise<Set<string>> {
    const desiredPrimaryLinkUrls = rewrites.map(
      ({ domainName }) => domainName.primaryLinkUrl,
    );

    if (desiredPrimaryLinkUrls.length === 0) {
      return new Set();
    }

    const rows = await dataSource.query<
      { domainNamePrimaryLinkUrl: string }[]
    >(
      `
SELECT company."domainNamePrimaryLinkUrl"
FROM "${schemaName}"."company" company
WHERE company."domainNamePrimaryLinkUrl" = ANY($1::text[])
  AND company."id" <> ALL($2::uuid[])
`,
      [desiredPrimaryLinkUrls, rewrites.map(({ id }) => id)],
    );

    return new Set(
      rows.map(({ domainNamePrimaryLinkUrl }) => domainNamePrimaryLinkUrl),
    );
  }
}

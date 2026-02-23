import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { DataSource, Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { STANDARD_AGENT } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-agent.constant';
import { STANDARD_ROLE } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-role.constant';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';

const OLD_ROLE_ADMIN_UNIVERSAL_IDENTIFIER =
  '20202020-0001-0001-0001-000000000001';
const OLD_AGENT_HELPER_UNIVERSAL_IDENTIFIER =
  '20202020-0002-0001-0001-000000000004';

@Command({
  name: 'upgrade:1-19:fix-role-and-agent-universal-identifiers',
  description:
    'Fix invalid universalIdentifier values in core.role and core.agent tables to comply with UUID v4 format',
})
export class FixRoleAndAgentUniversalIdentifiersCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
    protected readonly twentyORMGlobalManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
  ) {
    super(workspaceRepository, twentyORMGlobalManager, dataSourceService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options?.dryRun ?? false;

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Fixing role and agent universalIdentifiers for workspace ${workspaceId}`,
    );

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Would update role universalIdentifier from ${OLD_ROLE_ADMIN_UNIVERSAL_IDENTIFIER} to ${STANDARD_ROLE.admin.universalIdentifier} and agent universalIdentifier from ${OLD_AGENT_HELPER_UNIVERSAL_IDENTIFIER} to ${STANDARD_AGENT.helper.universalIdentifier} in workspace ${workspaceId}. Skipping.`,
      );

      return;
    }

    const queryRunner = this.coreDataSource.createQueryRunner();

    await queryRunner.connect();

    try {
      const roleResult = await queryRunner.query(
        `UPDATE core."role"
         SET "universalIdentifier" = $1
         WHERE "workspaceId" = $2
           AND "universalIdentifier" = $3`,
        [
          STANDARD_ROLE.admin.universalIdentifier,
          workspaceId,
          OLD_ROLE_ADMIN_UNIVERSAL_IDENTIFIER,
        ],
      );

      const roleUpdatedCount = roleResult?.[1] ?? 0;

      if (roleUpdatedCount > 0) {
        this.logger.log(
          `Updated ${roleUpdatedCount} role universalIdentifier in workspace ${workspaceId}`,
        );
      }

      const agentResult = await queryRunner.query(
        `UPDATE core."agent"
         SET "universalIdentifier" = $1
         WHERE "workspaceId" = $2
           AND "universalIdentifier" = $3`,
        [
          STANDARD_AGENT.helper.universalIdentifier,
          workspaceId,
          OLD_AGENT_HELPER_UNIVERSAL_IDENTIFIER,
        ],
      );

      const agentUpdatedCount = agentResult?.[1] ?? 0;

      if (agentUpdatedCount > 0) {
        this.logger.log(
          `Updated ${agentUpdatedCount} agent universalIdentifier in workspace ${workspaceId}`,
        );
      }

      if (roleUpdatedCount === 0 && agentUpdatedCount === 0) {
        this.logger.log(
          `No role or agent universalIdentifiers needed updating in workspace ${workspaceId}`,
        );
      }
    } finally {
      await queryRunner.release();
    }
  }
}

import { Command } from 'nest-commander';
import {
  IANA_TIME_ZONES,
  LEGACY_TIME_ZONE_TO_IANA,
} from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

@RegisteredWorkspaceCommand('2.20.0', 1783685009260)
@Command({
  name: 'upgrade:2-20:normalize-workspace-member-time-zones',
  description:
    'Rewrite stored workspaceMember.timeZone values: legacy IANA aliases (CET/MET/WET/EET, rejected by WebKit and crashing its date rendering) to their canonical region zone, and any value outside the supported list to system.',
})
export class NormalizeWorkspaceMemberTimeZonesCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    dataSource,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    if (!isDefined(dataSource)) {
      this.logger.log(`No data source for workspace ${workspaceId}, skipping`);

      return;
    }

    const schemaName = getWorkspaceSchemaName(workspaceId);
    const validTimeZones = [...IANA_TIME_ZONES, 'system'];

    const [{ count: invalidCount }]: { count: number }[] =
      await dataSource.query(
        `SELECT count(*)::int AS count
         FROM "${schemaName}"."workspaceMember"
         WHERE "timeZone" IS NOT NULL
           AND NOT ("timeZone" = ANY($1))`,
        [validTimeZones],
      );

    const legacyAliases = Object.keys(LEGACY_TIME_ZONE_TO_IANA);
    const [{ count: legacyAliasCount }]: { count: number }[] =
      await dataSource.query(
        `SELECT count(*)::int AS count
         FROM "${schemaName}"."workspaceMember"
         WHERE "timeZone" = ANY($1)`,
        [legacyAliases],
      );

    if (invalidCount === 0 && legacyAliasCount === 0) {
      return;
    }

    if (options.dryRun) {
      this.logger.log(
        `[DRY RUN] Would remap ${legacyAliasCount} legacy alias time zone(s) and reset ${invalidCount} unsupported time zone(s) to 'system' in workspace ${workspaceId}`,
      );

      return;
    }

    // The keys and values interpolated below come from constants, not user
    // input.
    const aliasCaseBranches = Object.entries(LEGACY_TIME_ZONE_TO_IANA)
      .map(([alias, canonical]) => `WHEN '${alias}' THEN '${canonical}'`)
      .join(' ');

    await dataSource.query(
      `UPDATE "${schemaName}"."workspaceMember"
       SET "timeZone" = CASE "timeZone" ${aliasCaseBranches} END
       WHERE "timeZone" = ANY($1)`,
      [legacyAliases],
    );

    await dataSource.query(
      `UPDATE "${schemaName}"."workspaceMember"
       SET "timeZone" = 'system'
       WHERE "timeZone" IS NOT NULL
         AND NOT ("timeZone" = ANY($1))`,
      [validTimeZones],
    );

    this.logger.log(
      `Remapped ${legacyAliasCount} legacy alias time zone(s) and reset ${invalidCount} unsupported time zone(s) to 'system' in workspace ${workspaceId}`,
    );
  }
}

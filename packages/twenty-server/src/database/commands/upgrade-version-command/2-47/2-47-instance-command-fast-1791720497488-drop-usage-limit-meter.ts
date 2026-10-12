import { type QueryRunner } from 'typeorm';

import { ensureUsageLimitMeterCompatibility } from 'src/database/commands/upgrade-version-command/2-46/utils/ensure-usage-limit-meter-compatibility.util';
import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

// 2.46 servers never read or write meter, so only 2.45 servers needed the
// compatibility trigger. Quotas 2.46 could not map to a unit are neither
// deleted nor guessed here: they must be reconciled before upgrading.
@RegisteredInstanceCommand('2.47.0', 1791720497488)
export class DropUsageLimitMeterFastInstanceCommand implements FastInstanceCommand {
  constructor(private readonly workspaceCacheService: WorkspaceCacheService) {}

  public async up(queryRunner: QueryRunner): Promise<void> {
    const pendingUsageLimits: {
      resourceType: string;
      operationType: string;
      meter: string;
      count: string;
    }[] = await queryRunner.query(
      `SELECT "resourceType", "operationType", "meter", count(*) AS "count"
       FROM "core"."usageLimit"
       WHERE "unit" IS NULL
       GROUP BY 1, 2, 3`,
    );

    if (pendingUsageLimits.length > 0) {
      const inventory = pendingUsageLimits
        .map(
          ({ resourceType, operationType, meter, count }) =>
            `${resourceType}/${operationType}/${meter}: ${count}`,
        )
        .join(', ');

      throw new Error(
        `core."usageLimit" still holds quotas without a unit (${inventory}). Replace each with an equivalent unit-based limit, then rerun the upgrade.`,
      );
    }

    await queryRunner.query(
      `DROP TRIGGER "syncUsageLimitMeterAndUnit" ON "core"."usageLimit"`,
    );
    await queryRunner.query(
      `DROP FUNCTION "core"."syncUsageLimitMeterAndUnit"()`,
    );
    await queryRunner.query(`ALTER TABLE "core"."usageLimit" DROP COLUMN "meter"`);
    await queryRunner.query(
      `ALTER TABLE "core"."usageLimit" ALTER COLUMN "unit" SET NOT NULL`,
    );

    // 2.45 and 2.46 servers shared the usageLimits cache key, so an entry a
    // 2.45 server computed can still hold limits without a unit. Flushing here
    // rather than in a workspace command also covers run-instance-commands.
    const workspaces: { workspaceId: string }[] = await queryRunner.query(
      `SELECT DISTINCT "workspaceId" FROM "core"."usageLimit"`,
    );

    for (const { workspaceId } of workspaces) {
      await this.workspaceCacheService.flush(workspaceId, ['usageLimits']);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await ensureUsageLimitMeterCompatibility(queryRunner);
  }
}

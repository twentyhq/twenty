import { Logger } from '@nestjs/common';

import { DataSource, QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

// Backfills uninstallLogicFunctionId from the registration manifest, which is
// where the uninstall hook was resolved from before the column existed. The
// declared universal identifier is only persisted when it resolves to a logic
// function owned by the application in the same workspace, so a registration
// manifest that advanced past the installed release cannot pin a foreign
// function. Unresolvable declarations stay NULL (hook skipped, as before) and
// self-heal on the application's next sync. The comparison casts the uuid
// column to text rather than the manifest value to uuid: uuid-to-text never
// fails, so a malformed manifest value cannot abort the upgrade.
@RegisteredInstanceCommand('2.32.0', 1786623564994, { type: 'slow' })
export class BackfillUninstallLogicFunctionIdOnApplicationSlowInstanceCommand
  implements SlowInstanceCommand
{
  private readonly logger = new Logger(
    BackfillUninstallLogicFunctionIdOnApplicationSlowInstanceCommand.name,
  );

  async runDataMigration(dataSource: DataSource): Promise<void> {
    const updatedRows: { count: string }[] = await dataSource.query(
      `WITH "updated" AS (
         UPDATE "core"."application" "application"
         SET "uninstallLogicFunctionId" = "logicFunction"."id"
         FROM "core"."applicationRegistration" "applicationRegistration",
              "core"."logicFunction" "logicFunction"
         WHERE "applicationRegistration"."id" = "application"."applicationRegistrationId"
         AND "applicationRegistration"."manifest" -> 'application' -> 'uninstallLogicFunction' ->> 'universalIdentifier' IS NOT NULL
         AND "logicFunction"."workspaceId" = "application"."workspaceId"
         AND "logicFunction"."applicationId" = "application"."id"
         AND "logicFunction"."universalIdentifier"::text = lower("applicationRegistration"."manifest" -> 'application' -> 'uninstallLogicFunction' ->> 'universalIdentifier')
         AND "logicFunction"."deletedAt" IS NULL
         AND "application"."deletedAt" IS NULL
         RETURNING "application"."id"
       )
       SELECT COUNT(*) AS "count" FROM "updated"`,
    );

    this.logger.log(
      `core.application: backfilled uninstallLogicFunctionId on ${Number(updatedRows[0]?.count ?? 0)} row(s)`,
    );
  }

  public async up(_queryRunner: QueryRunner): Promise<void> {
    return;
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'UPDATE "core"."application" SET "uninstallLogicFunctionId" = NULL',
    );
  }
}

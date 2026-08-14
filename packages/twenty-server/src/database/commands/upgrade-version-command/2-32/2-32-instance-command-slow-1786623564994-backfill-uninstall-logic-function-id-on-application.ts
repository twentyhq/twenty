import { Logger } from '@nestjs/common';

import { DataSource, QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

// The CASE guard keeps a malformed manifest identifier from aborting the
// upgrade; unresolvable declarations stay NULL and self-heal on next sync.
@RegisteredInstanceCommand('2.32.0', 1786623564994, { type: 'slow' })
export class BackfillUninstallLogicFunctionIdOnApplicationSlowInstanceCommand
  implements SlowInstanceCommand
{
  private readonly logger = new Logger(
    BackfillUninstallLogicFunctionIdOnApplicationSlowInstanceCommand.name,
  );

  async runDataMigration(dataSource: DataSource): Promise<void> {
    const updatedRows: { id: string }[] = await dataSource.query(
      `UPDATE "core"."application" "application"
       SET "uninstallLogicFunctionId" = "logicFunction"."id"
       FROM "core"."applicationRegistration" "applicationRegistration",
            "core"."logicFunction" "logicFunction"
       WHERE "applicationRegistration"."id" = "application"."applicationRegistrationId"
       AND "logicFunction"."workspaceId" = "application"."workspaceId"
       AND "logicFunction"."applicationId" = "application"."id"
       AND "logicFunction"."universalIdentifier" = CASE
         WHEN "applicationRegistration"."manifest" -> 'application' -> 'uninstallLogicFunction' ->> 'universalIdentifier' ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
         THEN ("applicationRegistration"."manifest" -> 'application' -> 'uninstallLogicFunction' ->> 'universalIdentifier')::uuid
       END
       AND "logicFunction"."deletedAt" IS NULL
       AND "application"."deletedAt" IS NULL
       RETURNING "application"."id"`,
    );

    this.logger.log(
      `core.application: backfilled uninstallLogicFunctionId on ${updatedRows.length} row(s)`,
    );
  }

  public async up(_queryRunner: QueryRunner): Promise<void> {}

  // The paired fast command's down drops the column; nothing to undo here.
  public async down(_queryRunner: QueryRunner): Promise<void> {}
}

import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

// Repairs instances that upgraded from 2.23.x, where
// AddApplicationIdToKeyValuePairFastInstanceCommand was registered under the
// already-released 2.23.0 segment and got skipped by the forward-only upgrade
// cursor, leaving core.keyValuePair without applicationId. The DDL mirrors that
// command and is fully idempotent, so it is a no-op on healthy instances.
@RegisteredInstanceCommand('2.24.0', 1784897347051)
export class RepairKeyValuePairApplicationIdFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "core"."keyValuePair_type_enum" ADD VALUE IF NOT EXISTS 'APPLICATION_VARIABLE'`,
    );
    await queryRunner.query(
      'ALTER TABLE "core"."keyValuePair" ADD COLUMN IF NOT EXISTS "applicationId" uuid',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."keyValuePair" DROP CONSTRAINT IF EXISTS "FK_e31d245e30cd82307e5416450fc"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."keyValuePair" ADD CONSTRAINT "FK_e31d245e30cd82307e5416450fc" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "IDX_KEY_VALUE_PAIR_APPLICATION_ID" ON "core"."keyValuePair" ("applicationId")',
    );

    await queryRunner.query(
      'DROP INDEX IF EXISTS "core"."IDX_KEY_VALUE_PAIR_KEY_WORKSPACE_ID_NULL_USER_ID_UNIQUE"',
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX "IDX_KEY_VALUE_PAIR_KEY_WORKSPACE_ID_NULL_USER_ID_UNIQUE" ON "core"."keyValuePair" ("key", "workspaceId") WHERE "userId" IS NULL AND "applicationId" IS NULL',
    );
    await queryRunner.query(
      'DROP INDEX IF EXISTS "core"."IDX_KEY_VALUE_PAIR_KEY_NULL_USER_ID_NULL_WORKSPACE_ID_UNIQUE"',
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX "IDX_KEY_VALUE_PAIR_KEY_NULL_USER_ID_NULL_WORKSPACE_ID_UNIQUE" ON "core"."keyValuePair" ("key") WHERE "userId" IS NULL AND "workspaceId" IS NULL AND "applicationId" IS NULL',
    );

    await queryRunner.query(
      'CREATE UNIQUE INDEX IF NOT EXISTS "IDX_KEY_VALUE_PAIR_KEY_APPLICATION_ID_WORKSPACE_UNIQUE" ON "core"."keyValuePair" ("key", "applicationId") WHERE "applicationId" IS NOT NULL AND "workspaceId" IS NOT NULL',
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX IF NOT EXISTS "IDX_KEY_VALUE_PAIR_KEY_APPLICATION_ID_GLOBAL_UNIQUE" ON "core"."keyValuePair" ("key", "applicationId") WHERE "applicationId" IS NOT NULL AND "workspaceId" IS NULL',
    );
  }

  // No-op: the applicationId column lifecycle is owned by the 2.23.0
  // introduction command. This command only repairs instances that skipped it,
  // so rolling it back must not drop the column or its constraints.
  public async down(): Promise<void> {}
}

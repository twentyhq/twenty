import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.23.0', 1784659343818)
export class AddApplicationIdToKeyValuePairFastInstanceCommand implements FastInstanceCommand {
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

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "core"."keyValuePair" WHERE "type" = 'APPLICATION_VARIABLE'`,
    );

    await queryRunner.query(
      'DROP INDEX IF EXISTS "core"."IDX_KEY_VALUE_PAIR_KEY_APPLICATION_ID_WORKSPACE_UNIQUE"',
    );
    await queryRunner.query(
      'DROP INDEX IF EXISTS "core"."IDX_KEY_VALUE_PAIR_KEY_APPLICATION_ID_GLOBAL_UNIQUE"',
    );
    await queryRunner.query(
      'DROP INDEX IF EXISTS "core"."IDX_KEY_VALUE_PAIR_APPLICATION_ID"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."keyValuePair" DROP CONSTRAINT IF EXISTS "FK_e31d245e30cd82307e5416450fc"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."keyValuePair" DROP COLUMN IF EXISTS "applicationId"',
    );

    await queryRunner.query(
      'DROP INDEX IF EXISTS "core"."IDX_KEY_VALUE_PAIR_KEY_WORKSPACE_ID_NULL_USER_ID_UNIQUE"',
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX "IDX_KEY_VALUE_PAIR_KEY_WORKSPACE_ID_NULL_USER_ID_UNIQUE" ON "core"."keyValuePair" ("key", "workspaceId") WHERE "userId" IS NULL',
    );
    await queryRunner.query(
      'DROP INDEX IF EXISTS "core"."IDX_KEY_VALUE_PAIR_KEY_NULL_USER_ID_NULL_WORKSPACE_ID_UNIQUE"',
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX "IDX_KEY_VALUE_PAIR_KEY_NULL_USER_ID_NULL_WORKSPACE_ID_UNIQUE" ON "core"."keyValuePair" ("key") WHERE "userId" IS NULL AND "workspaceId" IS NULL',
    );

    await queryRunner.query(
      `CREATE TYPE "core"."keyValuePair_type_enum_old" AS ENUM('USER_VARIABLE', 'FEATURE_FLAG', 'CONFIG_VARIABLE')`,
    );
    await queryRunner.query(
      'ALTER TABLE "core"."keyValuePair" ALTER COLUMN "type" DROP DEFAULT',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."keyValuePair" ALTER COLUMN "type" TYPE "core"."keyValuePair_type_enum_old" USING "type"::"text"::"core"."keyValuePair_type_enum_old"',
    );
    await queryRunner.query(
      `ALTER TABLE "core"."keyValuePair" ALTER COLUMN "type" SET DEFAULT 'USER_VARIABLE'`,
    );
    await queryRunner.query('DROP TYPE "core"."keyValuePair_type_enum"');
    await queryRunner.query(
      'ALTER TYPE "core"."keyValuePair_type_enum_old" RENAME TO "keyValuePair_type_enum"',
    );
  }
}

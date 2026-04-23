import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddConfigVariableVersionTable1775000000000
  implements MigrationInterface
{
  name = 'AddConfigVariableVersionTable1775000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "core"."configVariableVersion_action_enum" AS ENUM('SET', 'UPDATE', 'DELETE')`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."configVariableVersion" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "key" text NOT NULL, "action" "core"."configVariableVersion_action_enum" NOT NULL, "previousValue" jsonb, "nextValue" jsonb, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_9fca5f9c7e3e7dfe4f4de0a3f1d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_CONFIG_VARIABLE_VERSION_KEY_CREATED_AT" ON "core"."configVariableVersion" ("key", "createdAt") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "core"."IDX_CONFIG_VARIABLE_VERSION_KEY_CREATED_AT"`,
    );
    await queryRunner.query(`DROP TABLE "core"."configVariableVersion"`);
    await queryRunner.query(`DROP TYPE "core"."configVariableVersion_action_enum"`);
  }
}

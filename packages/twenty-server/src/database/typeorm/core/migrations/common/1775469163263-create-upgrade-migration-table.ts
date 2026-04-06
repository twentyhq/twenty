import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUpgradeMigrationTable1775469163263
  implements MigrationInterface
{
  name = 'CreateUpgradeMigrationTable1775469163263';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "core"."upgradeMigration_status_enum" AS ENUM ('completed', 'failed')`,
    );

    await queryRunner.query(
      `CREATE TABLE "core"."upgradeMigration" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "version" character varying NOT NULL,
        "name" character varying NOT NULL,
        "status" "core"."upgradeMigration_status_enum" NOT NULL,
        "retry" integer NOT NULL DEFAULT 0,
        "runByVersion" character varying NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_upgrade_migration_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_upgrade_migration_name" UNIQUE ("name")
      )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "core"."upgradeMigration"`);
    await queryRunner.query(
      `DROP TYPE "core"."upgradeMigration_status_enum"`,
    );
  }
}

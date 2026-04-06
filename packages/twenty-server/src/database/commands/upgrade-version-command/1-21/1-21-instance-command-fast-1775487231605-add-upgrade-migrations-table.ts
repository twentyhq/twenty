import { MigrationInterface, QueryRunner } from 'typeorm';

import { RegisteredInstanceMigration } from 'src/database/typeorm/core/decorators/registered-instance-migration.decorator';

@RegisteredInstanceMigration('1.21.0', 1775487231605)
export class V1_21_AddUpgradeMigrationsTable_1775487231605
  implements MigrationInterface
{
  name = 'V1_21_AddUpgradeMigrationsTable_1775487231605';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE "core"."upgradeMigration" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "status" character varying NOT NULL, "attempt" integer NOT NULL DEFAULT \'1\', "runByVersion" character varying NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_upgrade_migration_name_attempt" UNIQUE ("name", "attempt"), CONSTRAINT "PK_a43ea44de07f51fdc55b88af2ad" PRIMARY KEY ("id"))',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "core"."upgradeMigration"');
  }
}

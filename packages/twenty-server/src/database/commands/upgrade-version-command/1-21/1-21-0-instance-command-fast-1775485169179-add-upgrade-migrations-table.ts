import { MigrationInterface, QueryRunner } from 'typeorm';

import { RegisteredInstanceMigration } from 'src/database/typeorm/core/decorators/registered-instance-migration.decorator';

@RegisteredInstanceMigration('1.21.0', 1775485169179)
export class AddUpgradeMigrationsTableV12101775485169179
  implements MigrationInterface
{
  name = 'AddUpgradeMigrationsTableV12101775485169179';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE "core"."upgradeMigration" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "version" character varying NOT NULL, "name" character varying NOT NULL, "status" character varying NOT NULL, "retry" integer NOT NULL DEFAULT \'0\', "runByVersion" character varying NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_upgrade_migration_name_retry" UNIQUE ("name", "retry"), CONSTRAINT "PK_a43ea44de07f51fdc55b88af2ad" PRIMARY KEY ("id"))',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "core"."upgradeMigration"');
  }
}

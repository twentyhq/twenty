import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddWorkspaceIdToUpgradeMigration1775553825848
  implements MigrationInterface
{
  name = 'AddWorkspaceIdToUpgradeMigration1775553825848';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."upgradeMigration" DROP CONSTRAINT "UQ_upgrade_migration_name_attempt"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."upgradeMigration" ADD "workspaceId" uuid',
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX "UQ_upgrade_migration_workspace" ON "core"."upgradeMigration" ("name", "attempt", "workspaceId") WHERE "workspaceId" IS NOT NULL',
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX "UQ_upgrade_migration_instance" ON "core"."upgradeMigration" ("name", "attempt") WHERE "workspaceId" IS NULL',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."upgradeMigration" ADD CONSTRAINT "FK_77f64a697c55f8802592bd7eeba" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."upgradeMigration" DROP CONSTRAINT "FK_77f64a697c55f8802592bd7eeba"',
    );
    await queryRunner.query(
      'DROP INDEX "core"."UQ_upgrade_migration_instance"',
    );
    await queryRunner.query(
      'DROP INDEX "core"."UQ_upgrade_migration_workspace"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."upgradeMigration" DROP COLUMN "workspaceId"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."upgradeMigration" ADD CONSTRAINT "UQ_upgrade_migration_name_attempt" UNIQUE ("name", "attempt")',
    );
  }
}

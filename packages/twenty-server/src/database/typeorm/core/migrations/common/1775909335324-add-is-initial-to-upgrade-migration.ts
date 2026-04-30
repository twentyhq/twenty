import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsInitialToUpgradeMigration1775909335324
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."upgradeMigration" ADD "isInitial" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."upgradeMigration" DROP COLUMN "isInitial"`,
    );
  }
}

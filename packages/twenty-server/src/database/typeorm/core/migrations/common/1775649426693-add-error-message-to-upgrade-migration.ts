import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddErrorMessageToUpgradeMigration1775649426693
  implements MigrationInterface
{
  name = 'AddErrorMessageToUpgradeMigration1775649426693';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."upgradeMigration" ADD "errorMessage" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."upgradeMigration" DROP COLUMN "errorMessage"`,
    );
  }
}

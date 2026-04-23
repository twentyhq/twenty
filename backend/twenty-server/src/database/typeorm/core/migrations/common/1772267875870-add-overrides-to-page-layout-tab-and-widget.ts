import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddOverridesToPageLayoutTabAndWidget1772267875870
  implements MigrationInterface
{
  name = 'AddOverridesToPageLayoutTabAndWidget1772267875870';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutTab" ADD "overrides" jsonb`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutWidget" ADD "overrides" jsonb`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutWidget" DROP COLUMN "overrides"`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutTab" DROP COLUMN "overrides"`,
    );
  }
}

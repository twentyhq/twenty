import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddOverridesToViewFieldAndViewFieldGroup1773246310000
  implements MigrationInterface
{
  name = 'AddOverridesToViewFieldAndViewFieldGroup1773246310000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."viewField" ADD "overrides" jsonb`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."viewFieldGroup" ADD "overrides" jsonb`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."viewFieldGroup" DROP COLUMN "overrides"`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."viewField" DROP COLUMN "overrides"`,
    );
  }
}

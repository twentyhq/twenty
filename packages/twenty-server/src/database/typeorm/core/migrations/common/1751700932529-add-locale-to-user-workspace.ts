import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLocaleToUserWorkspace1751700932529
  implements MigrationInterface
{
  name = 'AddLocaleToUserWorkspace1751700932529';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" ADD "locale" character varying NOT NULL DEFAULT 'en'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" DROP COLUMN "locale"`,
    );
  }
}

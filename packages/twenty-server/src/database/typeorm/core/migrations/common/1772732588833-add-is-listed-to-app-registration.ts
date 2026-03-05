import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddIsListedToAppRegistration1772732588833
  implements MigrationInterface
{
  name = 'AddIsListedToAppRegistration1772732588833';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."applicationRegistration" ADD "isListed" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."applicationRegistration" DROP COLUMN "isListed"`,
    );
  }
}

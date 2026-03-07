import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class RemoveApplicationRegistrationIsListed1772960000000
  implements MigrationInterface
{
  name = 'RemoveApplicationRegistrationIsListed1772960000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."applicationRegistration" DROP COLUMN IF EXISTS "isListed"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."applicationRegistration" ADD COLUMN "isListed" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `UPDATE "core"."applicationRegistration" SET "isListed" = true WHERE "sourceType" = 'npm'`,
    );
  }
}

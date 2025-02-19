import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPasswordResetToken1704825571702 implements MigrationInterface {
  name = 'AddPasswordResetToken1704825571702';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."user" ADD "passwordResetToken" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."user" ADD "passwordResetTokenExpiresAt" TIMESTAMP`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."user" DROP COLUMN "passwordResetTokenExpiresAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."user" DROP COLUMN "passwordResetToken"`,
    );
  }
}

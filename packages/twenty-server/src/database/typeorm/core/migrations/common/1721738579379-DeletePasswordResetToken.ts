import { MigrationInterface, QueryRunner } from 'typeorm';

export class DeletePasswordResetToken1721738579379
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."user" DROP COLUMN "passwordResetToken"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."user" DROP COLUMN "passwordResetTokenExpiresAt"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."user" ADD "passwordResetToken" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."user" ADD "passwordResetTokenExpiresAt" TIMESTAMP`,
    );
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class MigratePasswordResetTokenToAppTokenTable1713457966698
  implements MigrationInterface
{
  name = 'MigratePasswordResetTokenToAppTokenTable1713457966698';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "core"."appToken" ("userId", "value", "expiresAt", "type")
      SELECT "id", "passwordResetToken", "passwordResetTokenExpiresAt", 'PASSWORD_RESET_TOKEN'
      FROM "core"."user"
      WHERE "passwordResetToken" IS NOT NULL AND "passwordResetTokenExpiresAt" IS NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "core"."appToken"
      WHERE type = 'PASSWORD_RESET_TOKEN'
    `);
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class TwoFactorAuthentication1751056798378
  implements MigrationInterface
{
  name = 'TwoFactorAuthentication1751056798378';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."twoFactorMethod" ADD "context" jsonb`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."twoFactorMethod_strategy_enum" AS ENUM('TOTP', 'HOTP')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."twoFactorMethod" ADD "strategy" "core"."twoFactorMethod_strategy_enum" NOT NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_11b49633fc51afba7d8b675110" ON "core"."twoFactorMethod" ("userWorkspaceId", "strategy") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "core"."IDX_11b49633fc51afba7d8b675110"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."twoFactorMethod" DROP COLUMN "strategy"`,
    );
    await queryRunner.query(`DROP TYPE "core"."twoFactorMethod_strategy_enum"`);
    await queryRunner.query(
      `ALTER TABLE "core"."twoFactorMethod" DROP COLUMN "context"`,
    );
  }
}

import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddSsoBypassFlag1761651107128 implements MigrationInterface {
  name = 'AddSsoBypassFlag1761651107128';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD "isGoogleAuthBypassEnabled" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD "isPasswordAuthBypassEnabled" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD "isMicrosoftAuthBypassEnabled" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" DROP COLUMN "isMicrosoftAuthBypassEnabled"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" DROP COLUMN "isPasswordAuthBypassEnabled"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" DROP COLUMN "isGoogleAuthBypassEnabled"`,
    );
  }
}

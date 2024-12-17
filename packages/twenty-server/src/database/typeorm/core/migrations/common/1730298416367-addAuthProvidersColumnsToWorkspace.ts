import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAuthProvidersColumnsToWorkspace1730298416367
  implements MigrationInterface
{
  name = 'AddAuthProvidersColumnsToWorkspace1730298416367';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD "isMicrosoftAuthEnabled" BOOLEAN DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD "isGoogleAuthEnabled" BOOLEAN DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD "isPasswordAuthEnabled" BOOLEAN DEFAULT true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" DROP COLUMN "isMicrosoftAuthEnabled"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" DROP COLUMN "isGoogleAuthEnabled"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" DROP COLUMN "isPasswordAuthEnabled"`,
    );
  }
}

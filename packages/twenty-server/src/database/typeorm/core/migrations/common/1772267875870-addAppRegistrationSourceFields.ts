import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddAppRegistrationSourceFields1772267875870
  implements MigrationInterface
{
  name = 'AddAppRegistrationSourceFields1772267875870';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."applicationRegistration"
        ADD COLUMN "sourceType" text NOT NULL DEFAULT 'none'`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."applicationRegistration"
        ADD COLUMN "sourcePackage" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."applicationRegistration"
        ADD COLUMN "tarballFileId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."applicationRegistration"
        ADD COLUMN "registryUrl" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."applicationRegistration"
        ADD COLUMN "latestAvailableVersion" text`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."applicationRegistration"
        ADD CONSTRAINT "FK_APP_REG_TARBALL_FILE"
        FOREIGN KEY ("tarballFileId") REFERENCES "core"."file"("id")
        ON DELETE SET NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."applicationRegistration"
        ADD CONSTRAINT "CHK_APP_REG_SOURCE_TYPE" CHECK (
          ("sourceType" = 'npm' AND "sourcePackage" IS NOT NULL)
          OR ("sourceType" = 'tarball')
          OR ("sourceType" = 'none')
        )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."applicationRegistration"
        DROP CONSTRAINT IF EXISTS "CHK_APP_REG_SOURCE_TYPE"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."applicationRegistration"
        DROP CONSTRAINT IF EXISTS "FK_APP_REG_TARBALL_FILE"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."applicationRegistration"
        DROP COLUMN IF EXISTS "latestAvailableVersion"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."applicationRegistration"
        DROP COLUMN IF EXISTS "registryUrl"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."applicationRegistration"
        DROP COLUMN IF EXISTS "tarballFileId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."applicationRegistration"
        DROP COLUMN IF EXISTS "sourcePackage"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."applicationRegistration"
        DROP COLUMN IF EXISTS "sourceType"`,
    );
  }
}

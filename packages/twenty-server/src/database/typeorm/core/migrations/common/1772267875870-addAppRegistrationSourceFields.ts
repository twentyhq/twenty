import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddAppRegistrationSourceFields1772267875870
  implements MigrationInterface
{
  name = 'AddAppRegistrationSourceFields1772267875870';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."applicationRegistration" ADD "sourceType" text NOT NULL DEFAULT 'local'`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."applicationRegistration" ADD "sourcePackage" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."applicationRegistration" ADD "tarballFileId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."applicationRegistration" ADD "latestAvailableVersion" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."applicationRegistration" ADD CONSTRAINT "REL_36715821de396df9536fd4afc8" UNIQUE ("tarballFileId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."applicationRegistration" ADD CONSTRAINT "FK_36715821de396df9536fd4afc81" FOREIGN KEY ("tarballFileId") REFERENCES "core"."file"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."applicationRegistration" ADD "isFeatured" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."applicationRegistration" ADD "marketplaceDisplayData" jsonb`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."applicationRegistration"
        ADD CONSTRAINT "CHK_NPM_HAS_SOURCE_PACKAGE"
        CHECK ("sourceType" <> 'npm' OR "sourcePackage" IS NOT NULL)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."applicationRegistration" DROP CONSTRAINT IF EXISTS "CHK_NPM_HAS_SOURCE_PACKAGE"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."applicationRegistration" DROP COLUMN "marketplaceDisplayData"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."applicationRegistration" DROP COLUMN "isFeatured"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."applicationRegistration" DROP CONSTRAINT "FK_36715821de396df9536fd4afc81"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."applicationRegistration" DROP CONSTRAINT "REL_36715821de396df9536fd4afc8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."applicationRegistration" DROP COLUMN "latestAvailableVersion"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."applicationRegistration" DROP COLUMN "tarballFileId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."applicationRegistration" DROP COLUMN "sourcePackage"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."applicationRegistration" DROP COLUMN "sourceType"`,
    );
  }
}

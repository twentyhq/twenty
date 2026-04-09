import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameMarketplaceDisplayDataToManifest1774472400000
  implements MigrationInterface
{
  name = 'RenameMarketplaceDisplayDataToManifest1774472400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."applicationRegistration" RENAME COLUMN "marketplaceDisplayData" TO "manifest"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."applicationRegistration" DROP COLUMN IF EXISTS "description"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."applicationRegistration" DROP COLUMN IF EXISTS "logoUrl"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."applicationRegistration" DROP COLUMN IF EXISTS "author"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."applicationRegistration" DROP COLUMN IF EXISTS "websiteUrl"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."applicationRegistration" DROP COLUMN IF EXISTS "termsUrl"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."applicationRegistration" ADD "termsUrl" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."applicationRegistration" ADD "websiteUrl" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."applicationRegistration" ADD "author" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."applicationRegistration" ADD "logoUrl" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."applicationRegistration" ADD "description" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."applicationRegistration" RENAME COLUMN "manifest" TO "marketplaceDisplayData"`,
    );
  }
}

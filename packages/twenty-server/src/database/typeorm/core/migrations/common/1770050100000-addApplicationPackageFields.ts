import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddApplicationPackageFields1770050100000
  implements MigrationInterface
{
  name = 'AddApplicationPackageFields1770050100000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."application" ADD "packageJsonChecksum" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" ADD "packageJsonFileId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" ADD "yarnLockChecksum" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" ADD "yarnLockFileId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" ADD "availablePackages" jsonb NOT NULL DEFAULT '{}'`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" ADD CONSTRAINT "FK_application_packageJsonFileId" FOREIGN KEY ("packageJsonFileId") REFERENCES "core"."file"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" ADD CONSTRAINT "FK_application_yarnLockFileId" FOREIGN KEY ("yarnLockFileId") REFERENCES "core"."file"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."application" DROP CONSTRAINT "FK_application_yarnLockFileId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" DROP CONSTRAINT "FK_application_packageJsonFileId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" DROP COLUMN "availablePackages"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" DROP COLUMN "yarnLockFileId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" DROP COLUMN "yarnLockChecksum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" DROP COLUMN "packageJsonFileId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" DROP COLUMN "packageJsonChecksum"`,
    );
  }
}

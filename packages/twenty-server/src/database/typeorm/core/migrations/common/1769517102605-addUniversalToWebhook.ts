import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddUniversalToWebhook1769517102605 implements MigrationInterface {
  name = 'AddUniversalToWebhook1769517102605';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."webhook" ADD "universalIdentifier" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."webhook" ADD "applicationId" uuid`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_d48d713d01cc3c81bad1f39795" ON "core"."webhook" ("workspaceId", "universalIdentifier") `,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."webhook" ADD CONSTRAINT "FK_e755f49a9ef74b36e27932f7a6c" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."webhook" DROP CONSTRAINT "FK_e755f49a9ef74b36e27932f7a6c"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_d48d713d01cc3c81bad1f39795"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."webhook" DROP COLUMN "applicationId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."webhook" DROP COLUMN "universalIdentifier"`,
    );
  }
}

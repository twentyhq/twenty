import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddUniversalIdentifierAndApplicationIdToPageLayout1764945428493
  implements MigrationInterface
{
  name = 'AddUniversalIdentifierAndApplicationIdToPageLayout1764945428493';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayout" ADD "universalIdentifier" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayout" ADD "applicationId" uuid`,
    );
    await queryRunner.query(
      `UPDATE "core"."pageLayout"
       SET "universalIdentifier" = gen_random_uuid(),
           "applicationId" = (
             SELECT "workspaceCustomApplicationId"
             FROM "core"."workspace"
             WHERE "workspace"."id" = "pageLayout"."workspaceId"
           )
       WHERE "universalIdentifier" IS NULL OR "applicationId" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayout" ALTER COLUMN "universalIdentifier" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayout" ALTER COLUMN "applicationId" SET NOT NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_256fabec226411154baba649df" ON "core"."pageLayout" ("workspaceId", "universalIdentifier") `,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayout" ADD CONSTRAINT "FK_5e7f19b88c0864db19e2bad0fc5" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayout" DROP CONSTRAINT "FK_5e7f19b88c0864db19e2bad0fc5"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_256fabec226411154baba649df"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayout" DROP COLUMN "applicationId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayout" DROP COLUMN "universalIdentifier"`,
    );
  }
}

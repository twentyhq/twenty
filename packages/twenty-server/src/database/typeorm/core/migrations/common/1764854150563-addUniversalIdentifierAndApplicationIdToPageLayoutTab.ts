import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddUniversalIdentifierAndApplicationIdToPageLayoutTab1764854150563
  implements MigrationInterface
{
  name = 'AddUniversalIdentifierAndApplicationIdToPageLayoutTab1764854150563';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const savepointName =
      'sp_add_universal_identifier_and_application_id_to_page_layout_tab';

    try {
      await queryRunner.query(`SAVEPOINT ${savepointName}`);

      // Add columns as nullable first
      await queryRunner.query(
        `ALTER TABLE "core"."pageLayoutTab" ADD "universalIdentifier" uuid`,
      );
      await queryRunner.query(
        `ALTER TABLE "core"."pageLayoutTab" ADD "applicationId" uuid`,
      );

      // Populate existing rows with universalIdentifier and applicationId
      await queryRunner.query(
        `UPDATE "core"."pageLayoutTab"
         SET "universalIdentifier" = gen_random_uuid(),
             "applicationId" = (
               SELECT "workspaceCustomApplicationId"
               FROM "core"."workspace"
               WHERE "workspace"."id" = "pageLayoutTab"."workspaceId"
             )
         WHERE "universalIdentifier" IS NULL OR "applicationId" IS NULL`,
      );

      // Add NOT NULL constraints
      await queryRunner.query(
        `ALTER TABLE "core"."pageLayoutTab" ALTER COLUMN "universalIdentifier" SET NOT NULL`,
      );
      await queryRunner.query(
        `ALTER TABLE "core"."pageLayoutTab" ALTER COLUMN "applicationId" SET NOT NULL`,
      );

      // Add unique index and foreign key
      await queryRunner.query(
        `CREATE UNIQUE INDEX "IDX_3763c4e8f942ff1e24040a13a9" ON "core"."pageLayoutTab" ("workspaceId", "universalIdentifier")`,
      );
      await queryRunner.query(
        `ALTER TABLE "core"."pageLayoutTab" ADD CONSTRAINT "FK_4493447c2e4029aa26cabf30460" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
      );

      await queryRunner.query(`RELEASE SAVEPOINT ${savepointName}`);
    } catch (e) {
      try {
        await queryRunner.query(`ROLLBACK TO SAVEPOINT ${savepointName}`);
        await queryRunner.query(`RELEASE SAVEPOINT ${savepointName}`);
      } catch (rollbackError) {
        // eslint-disable-next-line no-console
        console.error(
          'Failed to rollback to savepoint in AddUniversalIdentifierAndApplicationIdToPageLayoutTab1764854150563',
          rollbackError,
        );
        throw rollbackError;
      }

      // eslint-disable-next-line no-console
      console.error(
        'Swallowing AddUniversalIdentifierAndApplicationIdToPageLayoutTab1764854150563 error',
        e,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutTab" DROP CONSTRAINT "FK_4493447c2e4029aa26cabf30460"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_3763c4e8f942ff1e24040a13a9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutTab" DROP COLUMN "applicationId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutTab" DROP COLUMN "universalIdentifier"`,
    );
  }
}

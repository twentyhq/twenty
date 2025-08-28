import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class CreatePageWidgetLayoutEntity1756302117195
  implements MigrationInterface
{
  name = 'CreatePageWidgetLayoutEntity1756302117195';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "core"."pageLayoutWidget_type_enum" AS ENUM('VIEW', 'IFRAME', 'FIELDS', 'GRAPH')`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."pageLayoutWidget" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "pageLayoutTabId" uuid NOT NULL, "title" character varying NOT NULL, "type" "core"."pageLayoutWidget_type_enum" NOT NULL DEFAULT 'VIEW', "objectMetadataId" uuid, "gridPosition" jsonb NOT NULL, "configuration" jsonb, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_2f997489b8b15cb26a0b9d4220b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_PAGE_LAYOUT_WIDGET_PAGE_LAYOUT_TAB_ID" ON "core"."pageLayoutWidget" ("pageLayoutTabId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutWidget" ADD CONSTRAINT "FK_0659a4d171c93f5c046f18d24cd" FOREIGN KEY ("pageLayoutTabId") REFERENCES "core"."pageLayoutTab"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutWidget" ADD CONSTRAINT "FK_c4dc95034f53a12601e623d9171" FOREIGN KEY ("objectMetadataId") REFERENCES "core"."objectMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutWidget" DROP CONSTRAINT "FK_c4dc95034f53a12601e623d9171"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutWidget" DROP CONSTRAINT "FK_0659a4d171c93f5c046f18d24cd"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_PAGE_LAYOUT_WIDGET_PAGE_LAYOUT_TAB_ID"`,
    );
    await queryRunner.query(`DROP TABLE "core"."pageLayoutWidget"`);
    await queryRunner.query(`DROP TYPE "core"."pageLayoutWidget_type_enum"`);
  }
}

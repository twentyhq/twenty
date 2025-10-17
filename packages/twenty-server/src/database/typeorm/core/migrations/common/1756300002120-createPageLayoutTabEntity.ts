import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class CreatePageLayoutTabEntity1756300002120
  implements MigrationInterface
{
  name = 'CreatePageLayoutTabEntity1756300002120';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "core"."pageLayoutTab" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "position" integer NOT NULL DEFAULT '0', "pageLayoutId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_f1327f6ea950cdc59fe17569c5c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_PAGE_LAYOUT_TAB_PAGE_LAYOUT_ID" ON "core"."pageLayoutTab" ("pageLayoutId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutTab" ADD CONSTRAINT "FK_0177b1574efe6e6f24651977340" FOREIGN KEY ("pageLayoutId") REFERENCES "core"."pageLayout"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutTab" DROP CONSTRAINT "FK_0177b1574efe6e6f24651977340"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_PAGE_LAYOUT_TAB_PAGE_LAYOUT_ID"`,
    );
    await queryRunner.query(`DROP TABLE "core"."pageLayoutTab"`);
  }
}

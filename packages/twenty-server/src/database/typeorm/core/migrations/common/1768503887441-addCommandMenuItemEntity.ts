import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddCommandMenuItemEntity1768503887441
  implements MigrationInterface
{
  name = 'AddCommandMenuItemEntity1768503887441';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "core"."commandMenuItem_availabilitytype_enum" AS ENUM('GLOBAL', 'SINGLE_RECORD', 'BULK_RECORDS')`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."commandMenuItem" ("workspaceId" uuid NOT NULL, "universalIdentifier" uuid NOT NULL, "applicationId" uuid NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "workflowVersionId" uuid NOT NULL, "label" character varying NOT NULL, "icon" character varying, "isPinned" boolean NOT NULL DEFAULT false, "availabilityType" "core"."commandMenuItem_availabilitytype_enum" NOT NULL DEFAULT 'GLOBAL', "availabilityObjectMetadataId" uuid, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_fd076dc869e721593133fe8a007" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_a3a5976e1b580ba1086c595802" ON "core"."commandMenuItem" ("workspaceId", "universalIdentifier")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_COMMAND_MENU_ITEM_WORKFLOW_VERSION_ID_WORKSPACE_ID" ON "core"."commandMenuItem" ("workflowVersionId", "workspaceId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."commandMenuItem" ADD CONSTRAINT "FK_94947770f00413f134a1ec01dd7" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."commandMenuItem" ADD CONSTRAINT "FK_ad42dd64b117491a38120466d65" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."commandMenuItem" ADD CONSTRAINT "FK_6e050fb56a8385718123a4f8bc6" FOREIGN KEY ("availabilityObjectMetadataId") REFERENCES "core"."objectMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."commandMenuItem" DROP CONSTRAINT "FK_6e050fb56a8385718123a4f8bc6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."commandMenuItem" DROP CONSTRAINT "FK_ad42dd64b117491a38120466d65"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."commandMenuItem" DROP CONSTRAINT "FK_94947770f00413f134a1ec01dd7"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_COMMAND_MENU_ITEM_WORKFLOW_VERSION_ID_WORKSPACE_ID"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_a3a5976e1b580ba1086c595802"`,
    );
    await queryRunner.query(`DROP TABLE "core"."commandMenuItem"`);
    await queryRunner.query(
      `DROP TYPE "core"."commandMenuItem_availabilitytype_enum"`,
    );
  }
}

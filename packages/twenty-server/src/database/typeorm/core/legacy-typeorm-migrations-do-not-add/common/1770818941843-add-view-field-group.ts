import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddViewFieldGroup1770818941843 implements MigrationInterface {
  name = 'AddViewFieldGroup1770818941843';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "core"."viewFieldGroup" ("workspaceId" uuid NOT NULL, "universalIdentifier" uuid NOT NULL, "applicationId" uuid NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" text NOT NULL, "position" double precision NOT NULL DEFAULT '0', "isVisible" boolean NOT NULL DEFAULT true, "viewId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_006f1cb78ab9eeef56c3e305009" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_e88d35604c4445b16e682edb30" ON "core"."viewFieldGroup" ("workspaceId", "universalIdentifier") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_VIEW_FIELD_GROUP_VIEW_ID" ON "core"."viewFieldGroup" ("viewId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_VIEW_FIELD_GROUP_WORKSPACE_ID_VIEW_ID" ON "core"."viewFieldGroup" ("workspaceId", "viewId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewField" ADD "viewFieldGroupId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFieldGroup" ADD CONSTRAINT "FK_118208b32ebf53be5aaede9c9cf" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFieldGroup" ADD CONSTRAINT "FK_38ec9201914a42386e5cdaa6521" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFieldGroup" ADD CONSTRAINT "FK_15c7197294c08e6e780d9734c99" FOREIGN KEY ("viewId") REFERENCES "core"."view"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewField" ADD CONSTRAINT "FK_d6f7c88260b1d4eaa8ad0f13c26" FOREIGN KEY ("viewFieldGroupId") REFERENCES "core"."viewFieldGroup"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."viewField" DROP CONSTRAINT "FK_d6f7c88260b1d4eaa8ad0f13c26"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFieldGroup" DROP CONSTRAINT "FK_15c7197294c08e6e780d9734c99"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFieldGroup" DROP CONSTRAINT "FK_38ec9201914a42386e5cdaa6521"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFieldGroup" DROP CONSTRAINT "FK_118208b32ebf53be5aaede9c9cf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewField" DROP COLUMN "viewFieldGroupId"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_VIEW_FIELD_GROUP_WORKSPACE_ID_VIEW_ID"`,
    );
    await queryRunner.query(`DROP INDEX "core"."IDX_VIEW_FIELD_GROUP_VIEW_ID"`);
    await queryRunner.query(
      `DROP INDEX "core"."IDX_e88d35604c4445b16e682edb30"`,
    );
    await queryRunner.query(`DROP TABLE "core"."viewFieldGroup"`);
  }
}

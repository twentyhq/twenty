import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddSkillEntity1766150000000 implements MigrationInterface {
  name = 'AddSkillEntity1766150000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "core"."skill" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "standardId" uuid,
        "name" character varying NOT NULL,
        "label" character varying NOT NULL,
        "icon" character varying,
        "description" text,
        "content" text NOT NULL,
        "workspaceId" uuid NOT NULL,
        "isCustom" boolean NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP WITH TIME ZONE,
        "universalIdentifier" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "applicationId" uuid,
        CONSTRAINT "PK_skill" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_SKILL_ID_DELETED_AT" ON "core"."skill" ("id", "deletedAt")
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_SKILL_NAME_WORKSPACE_ID_UNIQUE" ON "core"."skill" ("name", "workspaceId") WHERE "deletedAt" IS NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "core"."skill"
      ADD CONSTRAINT "FK_skill_workspace"
      FOREIGN KEY ("workspaceId")
      REFERENCES "core"."workspace"("id")
      ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "core"."skill"
      ADD CONSTRAINT "FK_skill_application"
      FOREIGN KEY ("applicationId")
      REFERENCES "core"."application"("id")
      ON DELETE SET NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "core"."skill" DROP CONSTRAINT "FK_skill_application"
    `);

    await queryRunner.query(`
      ALTER TABLE "core"."skill" DROP CONSTRAINT "FK_skill_workspace"
    `);

    await queryRunner.query(`
      DROP INDEX "core"."IDX_SKILL_NAME_WORKSPACE_ID_UNIQUE"
    `);

    await queryRunner.query(`
      DROP INDEX "core"."IDX_SKILL_ID_DELETED_AT"
    `);

    await queryRunner.query(`
      DROP TABLE "core"."skill"
    `);
  }
}

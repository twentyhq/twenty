import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddSkillEntity1767003000000 implements MigrationInterface {
  name = 'AddSkillEntity1767003000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "core"."skill" ("universalIdentifier" uuid, "applicationId" uuid, "workspaceId" uuid NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "standardId" uuid, "name" character varying NOT NULL, "label" character varying NOT NULL, "icon" character varying, "description" text, "content" text NOT NULL, "isCustom" boolean NOT NULL DEFAULT false, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_a5167c44f4d4e61423f7f5e43bf" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_e6398c21e6bb31b525272fac84" ON "core"."skill" ("workspaceId", "universalIdentifier")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_SKILL_ID_IS_ACTIVE" ON "core"."skill" ("id", "isActive")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_SKILL_NAME_WORKSPACE_ID_UNIQUE" ON "core"."skill" ("name", "workspaceId") WHERE "isActive" = true`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."skill" ADD CONSTRAINT "FK_b832ffda9048fae83e52fbe48a7" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."skill" ADD CONSTRAINT "FK_46f69b93b58666bb388c5c7785a" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."skill" DROP CONSTRAINT "FK_46f69b93b58666bb388c5c7785a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."skill" DROP CONSTRAINT "FK_b832ffda9048fae83e52fbe48a7"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_SKILL_NAME_WORKSPACE_ID_UNIQUE"`,
    );
    await queryRunner.query(`DROP INDEX "core"."IDX_SKILL_ID_IS_ACTIVE"`);
    await queryRunner.query(
      `DROP INDEX "core"."IDX_e6398c21e6bb31b525272fac84"`,
    );
    await queryRunner.query(`DROP TABLE "core"."skill"`);
  }
}

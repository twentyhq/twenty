import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddFrontComponent1768495429374 implements MigrationInterface {
  name = 'AddFrontComponent1768495429374';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "core"."frontComponent" ("workspaceId" uuid NOT NULL, "universalIdentifier" uuid NOT NULL, "applicationId" uuid NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_843479d93ef40e58dc4587339aa" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_a1413f7f0e71cb5825ac40c4fa" ON "core"."frontComponent" ("workspaceId", "universalIdentifier") `,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."frontComponent" ADD CONSTRAINT "FK_b5e4eea33659f066e865ab6afe0" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."frontComponent" ADD CONSTRAINT "FK_63e430d5f8e554c4282e7b48876" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."frontComponent" DROP CONSTRAINT "FK_63e430d5f8e554c4282e7b48876"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."frontComponent" DROP CONSTRAINT "FK_b5e4eea33659f066e865ab6afe0"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_a1413f7f0e71cb5825ac40c4fa"`,
    );
    await queryRunner.query(`DROP TABLE "core"."frontComponent"`);
  }
}

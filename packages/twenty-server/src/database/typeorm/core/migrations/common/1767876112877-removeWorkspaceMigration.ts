import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class RemoveWorkspaceMigration1767876112877
  implements MigrationInterface
{
  name = 'RemoveWorkspaceMigration1767876112877';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "core"."workspaceMigration"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "core"."workspaceMigration" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "migrations" jsonb, "name" character varying NOT NULL, "isCustom" boolean NOT NULL DEFAULT false, "appliedAt" TIMESTAMP WITH TIME ZONE, "workspaceId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_33f481ae58d08030a3a007efde1" PRIMARY KEY ("id"))`,
    );
  }
}

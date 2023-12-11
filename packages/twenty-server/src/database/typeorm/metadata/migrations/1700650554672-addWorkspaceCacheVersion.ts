import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddWorkspaceCacheVersion1700650554672
  implements MigrationInterface
{
  name = 'AddWorkspaceCacheVersion1700650554672';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "metadata"."workspaceCacheVersion" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "workspaceId" uuid NOT NULL, "version" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_1a80ecf2638b477809403cc26ed" UNIQUE ("workspaceId"), CONSTRAINT "PK_5d502f8dbfb5b9a8bf2439320e9" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "metadata"."workspaceCacheVersion"`);
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFunctionMetadataTable1721040829256
  implements MigrationInterface
{
  name = 'CreateFunctionMetadataTable1721040829256';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "metadata"."functionMetadata_syncstatus_enum" AS ENUM('NOT_READY', 'READY')`,
    );
    await queryRunner.query(
      `CREATE TABLE "metadata"."functionMetadata" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "syncStatus" "metadata"."functionMetadata_syncstatus_enum" NOT NULL DEFAULT 'NOT_READY', "workspaceId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "IndexOnNameAndWorkspaceIdUnique" UNIQUE ("name", "workspaceId"), CONSTRAINT "PK_254107a6a35ecdf6f392dc63d72" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."workspaceMigration" ALTER COLUMN "name" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TYPE "metadata"."relationMetadata_ondeleteaction_enum" RENAME TO "relationMetadata_ondeleteaction_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "metadata"."relationMetadata_ondeleteaction_enum" AS ENUM('CASCADE', 'RESTRICT', 'SET_NULL', 'NO_ACTION')`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."relationMetadata" ALTER COLUMN "onDeleteAction" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."relationMetadata" ALTER COLUMN "onDeleteAction" TYPE "metadata"."relationMetadata_ondeleteaction_enum" USING "onDeleteAction"::"text"::"metadata"."relationMetadata_ondeleteaction_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."relationMetadata" ALTER COLUMN "onDeleteAction" SET DEFAULT 'SET_NULL'`,
    );
    await queryRunner.query(
      `DROP TYPE "metadata"."relationMetadata_ondeleteaction_enum_old"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "metadata"."relationMetadata_ondeleteaction_enum_old" AS ENUM('CASCADE', 'RESTRICT', 'SET_NULL')`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."relationMetadata" ALTER COLUMN "onDeleteAction" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."relationMetadata" ALTER COLUMN "onDeleteAction" TYPE "metadata"."relationMetadata_ondeleteaction_enum_old" USING "onDeleteAction"::"text"::"metadata"."relationMetadata_ondeleteaction_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."relationMetadata" ALTER COLUMN "onDeleteAction" SET DEFAULT 'SET_NULL'`,
    );
    await queryRunner.query(
      `DROP TYPE "metadata"."relationMetadata_ondeleteaction_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "metadata"."relationMetadata_ondeleteaction_enum_old" RENAME TO "relationMetadata_ondeleteaction_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."workspaceMigration" ALTER COLUMN "name" DROP NOT NULL`,
    );
    await queryRunner.query(`DROP TABLE "metadata"."functionMetadata"`);
    await queryRunner.query(
      `DROP TYPE "metadata"."functionMetadata_syncstatus_enum"`,
    );
  }
}

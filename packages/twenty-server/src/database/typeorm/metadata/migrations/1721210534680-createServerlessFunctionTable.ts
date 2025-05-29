import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateServerlessFunctionTable1721210534680
  implements MigrationInterface
{
  name = 'CreateServerlessFunctionTable1721210534680';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "core"."serverlessFunction_syncstatus_enum" AS ENUM('NOT_READY', 'READY')`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."serverlessFunction" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "sourceCodeHash" character varying NOT NULL, "syncStatus" "core"."serverlessFunction_syncstatus_enum" NOT NULL DEFAULT 'NOT_READY', "workspaceId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "IndexOnNameAndWorkspaceIdUnique" UNIQUE ("name", "workspaceId"), CONSTRAINT "PK_49bfacee064bee9d0d486483b60" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "core"."serverlessFunction"`);
    await queryRunner.query(
      `DROP TYPE "core"."serverlessFunction_syncstatus_enum"`,
    );
  }
}

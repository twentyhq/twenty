import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class RemoteRemoteTables1767812158000 implements MigrationInterface {
  name = 'RemoteRemoteTables1767812158000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "core"."remoteTable"`);
    await queryRunner.query(`DROP TABLE "core"."remoteServer"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "core"."remoteTable" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "distantTableName" character varying NOT NULL, "localTableName" character varying NOT NULL, "workspaceId" uuid NOT NULL, "remoteServerId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_632b3858de52c8c2eb00c709b52" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."remoteServer" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "foreignDataWrapperId" uuid NOT NULL DEFAULT uuid_generate_v4(), "foreignDataWrapperType" text, "label" text, "foreignDataWrapperOptions" jsonb, "userMappingOptions" jsonb, "schema" text, "workspaceId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_8e5d208498fa2c9710bb934023a" PRIMARY KEY ("id"))`,
    );
  }
}

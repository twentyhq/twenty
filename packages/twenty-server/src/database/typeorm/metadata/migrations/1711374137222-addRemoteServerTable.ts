import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRemoteServerTable1711374137222 implements MigrationInterface {
  name = 'AddRemoteServerTable1711374137222';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "core"."remoteServer" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "foreignDataWrapperId" uuid NOT NULL DEFAULT uuid_generate_v4(), "foreignDataWrapperType" character varying, "foreignDataWrapperOptions" jsonb, "userMappingOptions" jsonb, "workspaceId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_8e5d208498fa2c9710bb934023a" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "core"."remoteServer"`);
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRemoteServerTable1711104284380 implements MigrationInterface {
  name = 'AddRemoteServerTable1711104284380';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "metadata"."remoteServer" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "fdwId" uuid NOT NULL DEFAULT uuid_generate_v4(), "fdwType" character varying, "fdwOptions" jsonb, "userMappingOptions" jsonb, "workspaceId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_8e5d208498fa2c9710bb934023a" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "metadata"."remoteServer"`);
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRemoteServerTable1711041448958 implements MigrationInterface {
  name = 'AddRemoteServerTable1711041448958';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "metadata"."remoteServer" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "fdwId" uuid NOT NULL DEFAULT uuid_generate_v4(), "host" character varying, "port" character varying, "database" character varying, "username" character varying, "password" character varying, "schema" character varying, "workspaceId" uuid NOT NULL, "type" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_8e5d208498fa2c9710bb934023a" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "metadata"."remoteServer"`);
  }
}

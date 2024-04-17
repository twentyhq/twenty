import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRemoteTable1713270565699 implements MigrationInterface {
  name = 'CreateRemoteTable1713270565699';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "metadata"."remoteTable" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "distantTableName" character varying NOT NULL, "localTableName" character varying NOT NULL, "workspaceId" uuid NOT NULL, "remoteServerId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_632b3858de52c8c2eb00c709b52" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."remoteTable" ADD CONSTRAINT "FK_3db5ae954f9197def326053f06a" FOREIGN KEY ("remoteServerId") REFERENCES "metadata"."remoteServer"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "metadata"."remoteTable" DROP CONSTRAINT "FK_3db5ae954f9197def326053f06a"`,
    );
    await queryRunner.query(`DROP TABLE "metadata"."remoteTable"`);
  }
}

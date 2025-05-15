import { MigrationInterface, QueryRunner } from "typeorm";

export class AddInterIntegration1744396141753 implements MigrationInterface {
    name = 'AddInterIntegration1744396141753'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "core"."interIntegration" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "integrationName" character varying NOT NULL, "clientId" character varying NOT NULL, "clientSecret" character varying NOT NULL, "privateKey" text, "certificate" text, "status" character varying NOT NULL DEFAULT 'active', "expirationDate" TIMESTAMP, "workspaceId" uuid, CONSTRAINT "PK_85269b41f4539fe1ea619fec260" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "core"."interIntegration" ADD CONSTRAINT "FK_4a36f74493b025ae72702714a75" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "core"."interIntegration" DROP CONSTRAINT "FK_4a36f74493b025ae72702714a75"`);
        await queryRunner.query(`DROP TABLE "core"."interIntegration"`);
    }

}

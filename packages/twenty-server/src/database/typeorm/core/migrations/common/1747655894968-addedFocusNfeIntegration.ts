import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedFocusNfeIntegration1747655894968 implements MigrationInterface {
    name = 'AddedFocusNfeIntegration1747655894968'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "core"."focusNfeIntegration" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "integrationName" character varying NOT NULL, "token" character varying NOT NULL, "status" character varying NOT NULL DEFAULT 'active', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "workspaceId" uuid, CONSTRAINT "PK_18c9c9e2bdd44d65882c2ee0de7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "core"."focusNfeIntegration" ADD CONSTRAINT "FK_0654afaa2280f28f6ba3c10f92e" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "core"."focusNfeIntegration" DROP CONSTRAINT "FK_0654afaa2280f28f6ba3c10f92e"`);
        await queryRunner.query(`DROP TABLE "core"."focusNfeIntegration"`);
    }

}

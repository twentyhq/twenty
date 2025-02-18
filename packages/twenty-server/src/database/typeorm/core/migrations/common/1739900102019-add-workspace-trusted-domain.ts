import { MigrationInterface, QueryRunner } from "typeorm";

export class AddWorkspaceTrustedDomain1739900102019 implements MigrationInterface {
    name = 'AddWorkspaceTrustedDomain1739900102019'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "core"."workspaceTrustedDomain" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "domain" character varying NOT NULL, "isValidated" boolean NOT NULL DEFAULT false, "workspaceId" uuid NOT NULL, CONSTRAINT "PK_afa04c0f75f54a5e2c570c83cd6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IndexOnDomainAndWorkspaceId" ON "core"."workspaceTrustedDomain" ("domain", "workspaceId") `);
        await queryRunner.query(`ALTER TABLE "core"."workspaceTrustedDomain" ADD CONSTRAINT "FK_130f179c3608a3d8cde9d355d2e" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "core"."workspaceTrustedDomain" DROP CONSTRAINT "FK_130f179c3608a3d8cde9d355d2e"`);
        await queryRunner.query(`DROP INDEX "core"."IndexOnDomainAndWorkspaceId"`);
        await queryRunner.query(`DROP TABLE "core"."workspaceTrustedDomain"`);
    }

}

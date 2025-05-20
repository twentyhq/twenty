import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateIssuerTable1747678788078 implements MigrationInterface {
    name = 'CreateIssuerTable1747678788078'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "core"."issuer" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "cnpj" character varying NOT NULL, "cpf" character varying, "ie" character varying, "cnae_code" character varying, "cep" character varying NOT NULL, "street" character varying NOT NULL, "number" character varying NOT NULL, "neighborhood" character varying NOT NULL, "city" character varying NOT NULL, "state" character varying NOT NULL, "tax_regime" character varying NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "workspaceId" uuid NOT NULL, CONSTRAINT "PK_0650c5a53be3a0d22b580e27d25" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_a84b4074d07c928916bd7cf7a6" ON "core"."issuer" ("cnpj", "workspaceId") `);
        await queryRunner.query(`ALTER TABLE "core"."issuer" ADD CONSTRAINT "FK_babcab1df07beefe7fd9b359343" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "core"."issuer" DROP CONSTRAINT "FK_babcab1df07beefe7fd9b359343"`);
        await queryRunner.query(`DROP INDEX "core"."IDX_a84b4074d07c928916bd7cf7a6"`);
        await queryRunner.query(`DROP TABLE "core"."issuer"`);
    }

}

import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUniversalIdentifierAndApplicationIdToPageLayoutTab1764854150563 implements MigrationInterface {
    name = 'AddUniversalIdentifierAndApplicationIdToPageLayoutTab1764854150563'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "core"."pageLayoutTab" ADD "universalIdentifier" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "core"."pageLayoutTab" ADD "applicationId" uuid NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_3763c4e8f942ff1e24040a13a9" ON "core"."pageLayoutTab" ("workspaceId", "universalIdentifier") `);
        await queryRunner.query(`ALTER TABLE "core"."pageLayoutTab" ADD CONSTRAINT "FK_4493447c2e4029aa26cabf30460" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "core"."pageLayoutTab" DROP CONSTRAINT "FK_4493447c2e4029aa26cabf30460"`);
        await queryRunner.query(`DROP INDEX "core"."IDX_3763c4e8f942ff1e24040a13a9"`);
        await queryRunner.query(`ALTER TABLE "core"."pageLayoutTab" DROP COLUMN "applicationId"`);
        await queryRunner.query(`ALTER TABLE "core"."pageLayoutTab" DROP COLUMN "universalIdentifier"`);
    }

}


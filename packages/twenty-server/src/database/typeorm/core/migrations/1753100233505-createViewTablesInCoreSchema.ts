import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateViewTablesInCoreSchema1753100233505 implements MigrationInterface {
    name = 'CreateViewTablesInCoreSchema1753100233505'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "core"."viewFilter" DROP COLUMN "value"`);
        await queryRunner.query(`ALTER TABLE "core"."viewFilter" ADD "value" jsonb NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "core"."viewFilter" DROP COLUMN "value"`);
        await queryRunner.query(`ALTER TABLE "core"."viewFilter" ADD "value" text NOT NULL`);
    }

}

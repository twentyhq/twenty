import { MigrationInterface, QueryRunner } from "typeorm";

export class CoreMigrationCheck1756908577914 implements MigrationInterface {
    name = 'CoreMigrationCheck1756908577914'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "core"."fieldMetadata" ADD "morphId" uuid`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "core"."fieldMetadata" DROP COLUMN "morphId"`);
    }

}

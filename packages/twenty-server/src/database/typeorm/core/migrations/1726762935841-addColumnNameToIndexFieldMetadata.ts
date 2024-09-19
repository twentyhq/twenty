import { MigrationInterface, QueryRunner } from "typeorm";

export class AddColumnNameToIndexFieldMetadata1726762935841 implements MigrationInterface {
    name = 'AddColumnNameToIndexFieldMetadata1726762935841'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "metadata"."indexFieldMetadata" ADD "compositeColumn" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "metadata"."indexFieldMetadata" DROP COLUMN "compositeColumn"`);
    }

}

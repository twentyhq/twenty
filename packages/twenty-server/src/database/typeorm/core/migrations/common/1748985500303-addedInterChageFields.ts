import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedInterChageFields1748985500303 implements MigrationInterface {
    name = 'AddedInterChageFields1748985500303'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "core"."workspace" ADD "interBillingChargeId" character varying`);
        await queryRunner.query(`ALTER TABLE "core"."workspace" ADD CONSTRAINT "UQ_bdedf920319ca8d8ad783324c57" UNIQUE ("interBillingChargeId")`);
        await queryRunner.query(`ALTER TABLE "core"."workspace" ADD "interBillingChargeFilePath" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "core"."workspace" DROP COLUMN "interBillingChargeFilePath"`);
        await queryRunner.query(`ALTER TABLE "core"."workspace" DROP CONSTRAINT "UQ_bdedf920319ca8d8ad783324c57"`);
        await queryRunner.query(`ALTER TABLE "core"."workspace" DROP COLUMN "interBillingChargeId"`);
    }

}

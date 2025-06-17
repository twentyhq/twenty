import { MigrationInterface, QueryRunner } from "typeorm";

export class TwoFactorAuthentication1750195445347 implements MigrationInterface {
    name = 'TwoFactorAuthentication1750195445347'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "core"."workspace" ADD "twoFactorAuthenticationPolicy" jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "core"."workspace" DROP COLUMN "twoFactorAuthenticationPolicy"`);
    }

}

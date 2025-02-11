import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCreatorEmailFieldToWorkspace1737754366213 implements MigrationInterface {
    name = 'AddCreatorEmailFieldToWorkspace1737754366213'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "core"."workspace" ADD "creatorEmail" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "core"."workspace" DROP COLUMN "creatorEmail"`);
    }

}

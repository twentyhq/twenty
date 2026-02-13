import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLogoFileIdOnWorkspaceTable1770915831440 implements MigrationInterface {
    name = 'AddLogoFileIdOnWorkspaceTable1770915831440'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "core"."workspace" ADD "logoFileId" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "core"."workspace" DROP COLUMN "logoFileId"`);
    }

}

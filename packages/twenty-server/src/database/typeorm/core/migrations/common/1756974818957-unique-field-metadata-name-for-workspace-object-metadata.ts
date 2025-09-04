import { MigrationInterface, QueryRunner } from "typeorm";

export class UniqueFieldMetadataNameForWorkspaceObjectMetadata1756974818957 implements MigrationInterface {
    name = 'UniqueFieldMetadataNameForWorkspaceObjectMetadata1756974818957'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "core"."IDX_FIELD_METADATA_NAME_OBJMID_WORKSPACE_ID_EXCEPT_MORPH_UNIQUE"`);
        await queryRunner.query(`ALTER TABLE "core"."fieldMetadata" ADD "morphId" uuid`);
        await queryRunner.query(`ALTER TABLE "core"."fieldMetadata" ADD CONSTRAINT "CHK_FIELD_METADATA_MORPH_RELATION_REQUIRES_MORPH_ID" CHECK (("type" != 'MORPH_RELATION') OR ("type" = 'MORPH_RELATION' AND "morphId" IS NOT NULL))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "core"."fieldMetadata" DROP CONSTRAINT "CHK_FIELD_METADATA_MORPH_RELATION_REQUIRES_MORPH_ID"`);
        await queryRunner.query(`ALTER TABLE "core"."fieldMetadata" DROP COLUMN "morphId"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_FIELD_METADATA_NAME_OBJMID_WORKSPACE_ID_EXCEPT_MORPH_UNIQUE" ON "core"."fieldMetadata" ("objectMetadataId", "name", "workspaceId") WHERE ((type)::text <> 'MORPH_RELATION'::text)`);
    }

}

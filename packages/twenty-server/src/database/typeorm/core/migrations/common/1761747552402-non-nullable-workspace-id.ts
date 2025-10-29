import { MigrationInterface, QueryRunner } from "typeorm";

export class NonNullableWorkspaceId1761747552402 implements MigrationInterface {
    name = 'NonNullableWorkspaceId1761747552402'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "core"."keyValuePair" DROP CONSTRAINT "FK_c137e3d8b3980901e114941daa2"`);
        await queryRunner.query(`DROP INDEX "core"."IDX_KEY_VALUE_PAIR_KEY_WORKSPACE_ID_NULL_USER_ID_UNIQUE"`);
        await queryRunner.query(`ALTER TABLE "core"."keyValuePair" DROP CONSTRAINT "IDX_KEY_VALUE_PAIR_KEY_USER_ID_WORKSPACE_ID_UNIQUE"`);
        await queryRunner.query(`ALTER TABLE "core"."keyValuePair" ALTER COLUMN "workspaceId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "core"."appToken" DROP CONSTRAINT "FK_d6ae19a7aa2bbd4919053257772"`);
        await queryRunner.query(`ALTER TABLE "core"."appToken" ALTER COLUMN "workspaceId" SET NOT NULL`);
        await queryRunner.query(`DROP INDEX "core"."IDX_INDEX_METADATA_WORKSPACE_ID_OBJECT_METADATA_ID"`);
        await queryRunner.query(`DROP INDEX "core"."IDX_b27c681286ac581f81498c5d4b"`);
        await queryRunner.query(`ALTER TABLE "core"."indexMetadata" DROP CONSTRAINT "IDX_INDEX_METADATA_NAME_WORKSPACE_ID_OBJECT_METADATA_ID_UNIQUE"`);
        await queryRunner.query(`ALTER TABLE "core"."indexMetadata" DROP COLUMN "workspaceId"`);
        await queryRunner.query(`ALTER TABLE "core"."indexMetadata" ADD "workspaceId" uuid NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_KEY_VALUE_PAIR_KEY_WORKSPACE_ID_NULL_USER_ID_UNIQUE" ON "core"."keyValuePair" ("key", "workspaceId") WHERE "userId" is NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_b27c681286ac581f81498c5d4b" ON "core"."indexMetadata" ("workspaceId", "universalIdentifier") `);
        await queryRunner.query(`CREATE INDEX "IDX_INDEX_METADATA_WORKSPACE_ID_OBJECT_METADATA_ID" ON "core"."indexMetadata" ("workspaceId", "objectMetadataId") `);
        await queryRunner.query(`ALTER TABLE "core"."keyValuePair" ADD CONSTRAINT "IDX_KEY_VALUE_PAIR_KEY_USER_ID_WORKSPACE_ID_UNIQUE" UNIQUE ("key", "userId", "workspaceId")`);
        await queryRunner.query(`ALTER TABLE "core"."indexMetadata" ADD CONSTRAINT "IDX_INDEX_METADATA_NAME_WORKSPACE_ID_OBJECT_METADATA_ID_UNIQUE" UNIQUE ("name", "workspaceId", "objectMetadataId")`);
        await queryRunner.query(`ALTER TABLE "core"."keyValuePair" ADD CONSTRAINT "FK_c137e3d8b3980901e114941daa2" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "core"."appToken" ADD CONSTRAINT "FK_d6ae19a7aa2bbd4919053257772" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "core"."appToken" DROP CONSTRAINT "FK_d6ae19a7aa2bbd4919053257772"`);
        await queryRunner.query(`ALTER TABLE "core"."keyValuePair" DROP CONSTRAINT "FK_c137e3d8b3980901e114941daa2"`);
        await queryRunner.query(`ALTER TABLE "core"."indexMetadata" DROP CONSTRAINT "IDX_INDEX_METADATA_NAME_WORKSPACE_ID_OBJECT_METADATA_ID_UNIQUE"`);
        await queryRunner.query(`ALTER TABLE "core"."keyValuePair" DROP CONSTRAINT "IDX_KEY_VALUE_PAIR_KEY_USER_ID_WORKSPACE_ID_UNIQUE"`);
        await queryRunner.query(`DROP INDEX "core"."IDX_INDEX_METADATA_WORKSPACE_ID_OBJECT_METADATA_ID"`);
        await queryRunner.query(`DROP INDEX "core"."IDX_b27c681286ac581f81498c5d4b"`);
        await queryRunner.query(`DROP INDEX "core"."IDX_KEY_VALUE_PAIR_KEY_WORKSPACE_ID_NULL_USER_ID_UNIQUE"`);
        await queryRunner.query(`ALTER TABLE "core"."indexMetadata" DROP COLUMN "workspaceId"`);
        await queryRunner.query(`ALTER TABLE "core"."indexMetadata" ADD "workspaceId" character varying`);
        await queryRunner.query(`ALTER TABLE "core"."indexMetadata" ADD CONSTRAINT "IDX_INDEX_METADATA_NAME_WORKSPACE_ID_OBJECT_METADATA_ID_UNIQUE" UNIQUE ("name", "workspaceId", "objectMetadataId")`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_b27c681286ac581f81498c5d4b" ON "core"."indexMetadata" ("workspaceId", "universalIdentifier") `);
        await queryRunner.query(`CREATE INDEX "IDX_INDEX_METADATA_WORKSPACE_ID_OBJECT_METADATA_ID" ON "core"."indexMetadata" ("workspaceId", "objectMetadataId") `);
        await queryRunner.query(`ALTER TABLE "core"."appToken" ALTER COLUMN "workspaceId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "core"."appToken" ADD CONSTRAINT "FK_d6ae19a7aa2bbd4919053257772" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "core"."keyValuePair" ALTER COLUMN "workspaceId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "core"."keyValuePair" ADD CONSTRAINT "IDX_KEY_VALUE_PAIR_KEY_USER_ID_WORKSPACE_ID_UNIQUE" UNIQUE ("userId", "workspaceId", "key")`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_KEY_VALUE_PAIR_KEY_WORKSPACE_ID_NULL_USER_ID_UNIQUE" ON "core"."keyValuePair" ("workspaceId", "key") WHERE ("userId" IS NULL)`);
        await queryRunner.query(`ALTER TABLE "core"."keyValuePair" ADD CONSTRAINT "FK_c137e3d8b3980901e114941daa2" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}

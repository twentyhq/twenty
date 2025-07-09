import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFieldPermission1751993324990 implements MigrationInterface {
  name = 'AddFieldPermission1751993324990';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "core"."fieldPermission" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "roleId" uuid NOT NULL, "objectMetadataId" uuid NOT NULL, "fieldMetadataId" uuid NOT NULL, "canReadFieldValue" boolean, "canUpdateFieldValue" boolean, "workspaceId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "IDX_FIELD_PERMISSION_FIELD_METADATA_ID_ROLE_ID_UNIQUE" UNIQUE ("fieldMetadataId", "roleId"), CONSTRAINT "PK_d7bb911e4f9b1b5e3bfcfdd1c4b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_FIELD_PERMISSION_WORKSPACE_ID_ROLE_ID" ON "core"."fieldPermission" ("workspaceId", "roleId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."fieldPermission" ADD CONSTRAINT "FK_bbf16a91f5a10199e5b18c019ba" FOREIGN KEY ("roleId") REFERENCES "core"."role"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."fieldPermission" ADD CONSTRAINT "FK_dc8e552397f5e44d175fedf752a" FOREIGN KEY ("objectMetadataId") REFERENCES "core"."objectMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."fieldPermission" ADD CONSTRAINT "FK_d5c47a26fe71648894d05da3d3a" FOREIGN KEY ("fieldMetadataId") REFERENCES "core"."fieldMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."fieldPermission" ADD CONSTRAINT "FK_2763aee5614b54019d692333fe1" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."fieldPermission" DROP CONSTRAINT "FK_2763aee5614b54019d692333fe1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."fieldPermission" DROP CONSTRAINT "FK_d5c47a26fe71648894d05da3d3a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."fieldPermission" DROP CONSTRAINT "FK_dc8e552397f5e44d175fedf752a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."fieldPermission" DROP CONSTRAINT "FK_bbf16a91f5a10199e5b18c019ba"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_FIELD_PERMISSION_WORKSPACE_ID_ROLE_ID"`,
    );
    await queryRunner.query(`DROP TABLE "core"."fieldPermission"`);
  }
}

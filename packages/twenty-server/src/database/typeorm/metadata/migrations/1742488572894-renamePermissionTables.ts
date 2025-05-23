import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenamePermissionTables1742488572894 implements MigrationInterface {
  name = 'RenamePermissionTables1742488572894';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "core"."settingsPermissions"`);
    await queryRunner.query(`DROP TABLE "core"."objectPermissions"`);
    await queryRunner.query(
      `CREATE TABLE "core"."objectPermission" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "roleId" uuid NOT NULL, "objectMetadataId" uuid NOT NULL, "canReadObjectRecords" boolean, "canUpdateObjectRecords" boolean, "canSoftDeleteObjectRecords" boolean, "canDestroyObjectRecords" boolean, "workspaceId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "IndexOnObjectPermissionUnique" UNIQUE ("objectMetadataId", "roleId"), CONSTRAINT "PK_23a4033c1aa380d0d1431731add" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."settingPermission" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "roleId" uuid NOT NULL, "setting" character varying NOT NULL, "canUpdateSetting" boolean, "workspaceId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "IndexOnSettingPermissionUnique" UNIQUE ("setting", "roleId"), CONSTRAINT "PK_8c144a021030d7e3326835a04c8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."objectPermission" ADD CONSTRAINT "FK_826052747c82e59f0a006204256" FOREIGN KEY ("roleId") REFERENCES "core"."role"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."objectPermission" ADD CONSTRAINT "FK_efbcf3528718de2b5c45c0a8a83" FOREIGN KEY ("objectMetadataId") REFERENCES "core"."objectMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."settingPermission" ADD CONSTRAINT "FK_b327aadd9fd189f33d2c5237833" FOREIGN KEY ("roleId") REFERENCES "core"."role"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."settingPermission" DROP CONSTRAINT "FK_b327aadd9fd189f33d2c5237833"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."objectPermission" DROP CONSTRAINT "FK_efbcf3528718de2b5c45c0a8a83"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."objectPermission" DROP CONSTRAINT "FK_826052747c82e59f0a006204256"`,
    );
    await queryRunner.query(`DROP TABLE "core"."settingPermission"`);
    await queryRunner.query(`DROP TABLE "core"."objectPermission"`);
  }
}

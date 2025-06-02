import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixMetadataIndexes1748846032709 implements MigrationInterface {
  name = 'FixMetadataIndexes1748846032709';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "core"."IndexOnFieldMetadataId"`);
    await queryRunner.query(
      `DROP INDEX "core"."IndexOnRelationTargetObjectMetadataId"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IndexOnRelationTargetFieldMetadataId"`,
    );
    await queryRunner.query(`DROP INDEX "core"."IndexOnObjectMetadataId"`);
    await queryRunner.query(`DROP INDEX "core"."IndexOnWorkspaceId"`);
    await queryRunner.query(
      `ALTER TABLE "core"."indexMetadata" DROP CONSTRAINT "IndexOnNameAndWorkspaceIdAndObjectMetadataUnique"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."fieldMetadata" DROP CONSTRAINT "IndexOnNameObjectMetadataIdAndWorkspaceIdUnique"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."objectMetadata" DROP CONSTRAINT "IndexOnNamePluralAndWorkspaceIdUnique"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."objectMetadata" DROP CONSTRAINT "IndexOnNameSingularAndWorkspaceIdUnique"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."objectPermission" DROP CONSTRAINT "IndexOnObjectPermissionUnique"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspaceRole" DROP CONSTRAINT "IndexOnUserWorkspaceRoleUnique"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."role" DROP CONSTRAINT "IndexOnRoleUnique"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."settingPermission" DROP CONSTRAINT "IndexOnSettingPermissionUnique"`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_INDEX_FIELD_METADATA_FIELD_METADATA_ID" ON "core"."indexFieldMetadata" ("fieldMetadataId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_FIELD_METADATA_OBJECT_METADATA_ID" ON "core"."fieldMetadata" ("objectMetadataId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_FIELD_METADATA_WORKSPACE_ID" ON "core"."fieldMetadata" ("workspaceId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_FIELD_METADATA_OBJECT_METADATA_ID_WORKSPACE_ID" ON "core"."fieldMetadata" ("objectMetadataId", "workspaceId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_FIELD_METADATA_RELATION_TARGET_OBJECT_METADATA_ID" ON "core"."fieldMetadata" ("relationTargetObjectMetadataId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_FIELD_METADATA_RELATION_TARGET_FIELD_METADATA_ID" ON "core"."fieldMetadata" ("relationTargetFieldMetadataId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."indexMetadata" ADD CONSTRAINT "IDX_INDEX_METADATA_NAME_WORKSPACE_ID_OBJECT_METADATA_ID_UNIQUE" UNIQUE ("name", "workspaceId", "objectMetadataId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."fieldMetadata" ADD CONSTRAINT "IDX_FIELD_METADATA_NAME_OBJECT_METADATA_ID_WORKSPACE_ID_UNIQUE" UNIQUE ("name", "objectMetadataId", "workspaceId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."objectMetadata" ADD CONSTRAINT "IDX_OBJECT_METADATA_NAME_PLURAL_WORKSPACE_ID_UNIQUE" UNIQUE ("namePlural", "workspaceId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."objectMetadata" ADD CONSTRAINT "IDX_OBJECT_METADATA_NAME_SINGULAR_WORKSPACE_ID_UNIQUE" UNIQUE ("nameSingular", "workspaceId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."objectPermission" ADD CONSTRAINT "IDX_OBJECT_PERMISSION_OBJECT_METADATA_ID_ROLE_ID_UNIQUE" UNIQUE ("objectMetadataId", "roleId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspaceRole" ADD CONSTRAINT "IDX_USER_WORKSPACE_ROLE_USER_WORKSPACE_ID_ROLE_ID_UNIQUE" UNIQUE ("userWorkspaceId", "roleId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."role" ADD CONSTRAINT "IDX_ROLE_LABEL_WORKSPACE_ID_UNIQUE" UNIQUE ("label", "workspaceId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."settingPermission" ADD CONSTRAINT "IDX_SETTING_PERMISSION_SETTING_ROLE_ID_UNIQUE" UNIQUE ("setting", "roleId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."settingPermission" DROP CONSTRAINT "IDX_SETTING_PERMISSION_SETTING_ROLE_ID_UNIQUE"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."role" DROP CONSTRAINT "IDX_ROLE_LABEL_WORKSPACE_ID_UNIQUE"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspaceRole" DROP CONSTRAINT "IDX_USER_WORKSPACE_ROLE_USER_WORKSPACE_ID_ROLE_ID_UNIQUE"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."objectPermission" DROP CONSTRAINT "IDX_OBJECT_PERMISSION_OBJECT_METADATA_ID_ROLE_ID_UNIQUE"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."objectMetadata" DROP CONSTRAINT "IDX_OBJECT_METADATA_NAME_SINGULAR_WORKSPACE_ID_UNIQUE"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."objectMetadata" DROP CONSTRAINT "IDX_OBJECT_METADATA_NAME_PLURAL_WORKSPACE_ID_UNIQUE"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."fieldMetadata" DROP CONSTRAINT "IDX_FIELD_METADATA_NAME_OBJECT_METADATA_ID_WORKSPACE_ID_UNIQUE"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."indexMetadata" DROP CONSTRAINT "IDX_INDEX_METADATA_NAME_WORKSPACE_ID_OBJECT_METADATA_ID_UNIQUE"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_FIELD_METADATA_RELATION_TARGET_FIELD_METADATA_ID"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_FIELD_METADATA_RELATION_TARGET_OBJECT_METADATA_ID"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_FIELD_METADATA_OBJECT_METADATA_ID_WORKSPACE_ID"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_FIELD_METADATA_WORKSPACE_ID"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_FIELD_METADATA_OBJECT_METADATA_ID"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_INDEX_FIELD_METADATA_FIELD_METADATA_ID"`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."settingPermission" ADD CONSTRAINT "IndexOnSettingPermissionUnique" UNIQUE ("roleId", "setting")`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."role" ADD CONSTRAINT "IndexOnRoleUnique" UNIQUE ("label", "workspaceId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspaceRole" ADD CONSTRAINT "IndexOnUserWorkspaceRoleUnique" UNIQUE ("roleId", "userWorkspaceId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."objectPermission" ADD CONSTRAINT "IndexOnObjectPermissionUnique" UNIQUE ("roleId", "objectMetadataId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."objectMetadata" ADD CONSTRAINT "IndexOnNameSingularAndWorkspaceIdUnique" UNIQUE ("nameSingular", "workspaceId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."objectMetadata" ADD CONSTRAINT "IndexOnNamePluralAndWorkspaceIdUnique" UNIQUE ("namePlural", "workspaceId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."fieldMetadata" ADD CONSTRAINT "IndexOnNameObjectMetadataIdAndWorkspaceIdUnique" UNIQUE ("objectMetadataId", "name", "workspaceId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."indexMetadata" ADD CONSTRAINT "IndexOnNameAndWorkspaceIdAndObjectMetadataUnique" UNIQUE ("name", "workspaceId", "objectMetadataId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IndexOnWorkspaceId" ON "core"."fieldMetadata" ("workspaceId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IndexOnObjectMetadataId" ON "core"."fieldMetadata" ("objectMetadataId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IndexOnRelationTargetFieldMetadataId" ON "core"."fieldMetadata" ("relationTargetFieldMetadataId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IndexOnRelationTargetObjectMetadataId" ON "core"."fieldMetadata" ("relationTargetObjectMetadataId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IndexOnFieldMetadataId" ON "core"."indexFieldMetadata" ("fieldMetadataId") `,
    );
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class GeneratePermissionsV2Tables1742232505943
  implements MigrationInterface
{
  name = 'GeneratePermissionsV2Tables1742232505943';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "core"."objectPermissions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "roleId" uuid NOT NULL, "objectMetadataId" uuid NOT NULL, "canReadObjectRecords" boolean, "canUpdateObjectRecords" boolean, "canSoftDeleteObjectRecords" boolean, "canDestroyObjectRecords" boolean, "workspaceId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "IndexOnObjectPermissionsUnique" UNIQUE ("objectMetadataId", "roleId"), CONSTRAINT "PK_ea2c5c9a2dfa3d674da8b1350cd" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."settingsPermissions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "roleId" uuid NOT NULL, "setting" character varying NOT NULL, "canUpdateSetting" boolean, "workspaceId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "IndexOnSettingsPermissionsUnique" UNIQUE ("setting", "roleId"), CONSTRAINT "PK_44f120f1e527e62efa3fec8a846" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."objectPermissions" ADD CONSTRAINT "FK_770297c03e386df4c9fa4986ee1" FOREIGN KEY ("roleId") REFERENCES "core"."role"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."objectPermissions" ADD CONSTRAINT "FK_ddad09b4fdf32c88283ae815074" FOREIGN KEY ("objectMetadataId") REFERENCES "core"."objectMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."settingsPermissions" ADD CONSTRAINT "FK_712bf97e56c4040026dd887ed4a" FOREIGN KEY ("roleId") REFERENCES "core"."role"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."settingsPermissions" DROP CONSTRAINT "FK_712bf97e56c4040026dd887ed4a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."objectPermissions" DROP CONSTRAINT "FK_ddad09b4fdf32c88283ae815074"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."objectPermissions" DROP CONSTRAINT "FK_770297c03e386df4c9fa4986ee1"`,
    );
    await queryRunner.query(`DROP TABLE "core"."settingsPermissions"`);
    await queryRunner.query(`DROP TABLE "core"."objectPermissions"`);
  }
}

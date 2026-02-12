import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddObjectMetadataIdToRowLevelPermissionPredicateGroup1767998263185
  implements MigrationInterface
{
  name = 'AddObjectMetadataIdToRowLevelPermissionPredicateGroup1767998263185';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "core"."IDX_RLPPG_WORKSPACE_ID_ROLE_ID"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."rowLevelPermissionPredicateGroup" ADD "objectMetadataId" uuid NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_RLPPG_WORKSPACE_ID_ROLE_ID_OBJECT_METADATA_ID" ON "core"."rowLevelPermissionPredicateGroup" ("workspaceId", "roleId", "objectMetadataId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."rowLevelPermissionPredicateGroup" ADD CONSTRAINT "FK_ca604fd5ee245bca9f32ed67b9b" FOREIGN KEY ("objectMetadataId") REFERENCES "core"."objectMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."rowLevelPermissionPredicateGroup" DROP CONSTRAINT "FK_ca604fd5ee245bca9f32ed67b9b"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_RLPPG_WORKSPACE_ID_ROLE_ID_OBJECT_METADATA_ID"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."rowLevelPermissionPredicateGroup" DROP COLUMN "objectMetadataId"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_RLPPG_WORKSPACE_ID_ROLE_ID" ON "core"."rowLevelPermissionPredicateGroup" ("workspaceId", "roleId") `,
    );
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIndexOnObjectPermission1751890088507
  implements MigrationInterface
{
  name = 'AddIndexOnObjectPermission1751890088507';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_OBJECT_PERMISSION_WORKSPACE_ID_ROLE_ID" ON "core"."objectPermission" ("workspaceId", "roleId") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "core"."IDX_OBJECT_PERMISSION_WORKSPACE_ID_ROLE_ID"`,
    );
  }
}

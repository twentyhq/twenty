import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class FixDataSourceAndWorkspaceMigrationWorkspaceIdType1767200000000
  implements MigrationInterface
{
  name = 'FixDataSourceAndWorkspaceMigrationWorkspaceIdType1767200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."dataSource" ALTER COLUMN "workspaceId" TYPE uuid USING "workspaceId"::uuid`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."workspaceMigration" ALTER COLUMN "workspaceId" TYPE uuid USING "workspaceId"::uuid`,
    );
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // Rollback is intentionally not implemented
    // Converting uuid back to varchar could cause data loss and is not recommended
  }
}

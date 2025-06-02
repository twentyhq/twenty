import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixCoreIndexes21748849487789 implements MigrationInterface {
  name = 'FixCoreIndexes21748849487789';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" DROP CONSTRAINT "IndexOnUserIdAndWorkspaceIdUnique"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" ADD CONSTRAINT "IDX_USER_WORKSPACE_USER_ID_WORKSPACE_ID_UNIQUE" UNIQUE ("userId", "workspaceId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" DROP CONSTRAINT "IDX_USER_WORKSPACE_USER_ID_WORKSPACE_ID_UNIQUE"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" ADD CONSTRAINT "IndexOnUserIdAndWorkspaceIdUnique" UNIQUE ("userId", "workspaceId")`,
    );
  }
}

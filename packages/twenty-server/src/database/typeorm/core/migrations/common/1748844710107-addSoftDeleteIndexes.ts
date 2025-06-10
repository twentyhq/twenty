import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSoftDeleteIndexes1748844710107 implements MigrationInterface {
  name = 'AddSoftDeleteIndexes1748844710107';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_USER_WORKSPACE_WORKSPACE_ID" ON "core"."userWorkspace" ("workspaceId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_USER_WORKSPACE_USER_ID" ON "core"."userWorkspace" ("userId") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "core"."IDX_USER_WORKSPACE_USER_ID"`);
    await queryRunner.query(
      `DROP INDEX "core"."IDX_USER_WORKSPACE_WORKSPACE_ID"`,
    );
  }
}

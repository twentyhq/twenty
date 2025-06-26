import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveRelationMetadata1750673748111 implements MigrationInterface {
  name = 'RemoveRelationMetadata1750673748111';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_DATA_SOURCE_WORKSPACE_ID_CREATED_AT" ON "core"."dataSource" ("workspaceId", "createdAt") `,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."relationMetadata" DROP CONSTRAINT IF EXISTS "FK_9dea8f90d04edbbf9c541a95c3b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."relationMetadata" DROP CONSTRAINT IF EXISTS "FK_3deb257254145a3bdde9575e7d6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."relationMetadata" DROP CONSTRAINT IF EXISTS "FK_0f781f589e5a527b8f3d3a4b824"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."relationMetadata" DROP CONSTRAINT IF EXISTS "FK_f2a0acd3a548ee446a1a35df44d"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "core"."relationMetadata"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "core"."IDX_DATA_SOURCE_WORKSPACE_ID_CREATED_AT"`,
    );
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIndexOnRoleLabelAndWorkspaceId1742316060157
  implements MigrationInterface
{
  name = 'AddIndexOnRoleLabelAndWorkspaceId1742316060157';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."role" ADD CONSTRAINT "IndexOnRoleUnique" UNIQUE ("label", "workspaceId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."role" DROP CONSTRAINT "IndexOnRoleUnique"`,
    );
  }
}

import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class RemoveUniqueRoleLabelConstraint1766151070046
  implements MigrationInterface
{
  name = 'RemoveUniqueRoleLabelConstraint1766151070046';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."role" DROP CONSTRAINT "IDX_ROLE_LABEL_WORKSPACE_ID_UNIQUE"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."role" ADD CONSTRAINT "IDX_ROLE_LABEL_WORKSPACE_ID_UNIQUE" UNIQUE ("label", "workspaceId")`,
    );
  }
}

import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class UpdateMemberRoleCanAccessAllTools1753318977614
  implements MigrationInterface
{
  name = 'UpdateMemberRoleCanAccessAllTools1753318977614';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "core"."role" SET "canAccessAllTools" = true WHERE "label" = 'Member'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "core"."role" SET "canAccessAllTools" = false WHERE "label" = 'Member'`,
    );
  }
}

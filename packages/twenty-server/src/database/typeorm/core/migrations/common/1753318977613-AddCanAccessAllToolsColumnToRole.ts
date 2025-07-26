import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCanAccessAllToolsColumnToRole1753318977613
  implements MigrationInterface
{
  name = 'AddCanAccessAllToolsColumnToRole1753318977613';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."role" ADD "canAccessAllTools" boolean NOT NULL DEFAULT false`,
    );

    await queryRunner.query(
      `UPDATE "core"."role" SET "canAccessAllTools" = true WHERE "label" = 'Admin'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."role" DROP COLUMN "canAccessAllTools"`,
    );
  }
}

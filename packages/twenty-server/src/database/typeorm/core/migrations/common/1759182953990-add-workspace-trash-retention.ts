import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddWorkspaceTrashRetention1759182953990
  implements MigrationInterface
{
  name = 'AddWorkspaceTrashRetention1759182953990';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD "trashRetentionDays" integer NOT NULL DEFAULT '14'`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD CONSTRAINT "trash_retention_positive" CHECK ("trashRetentionDays" >= 0)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" DROP CONSTRAINT "trash_retention_positive"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" DROP COLUMN "trashRetentionDays"`,
    );
  }
}

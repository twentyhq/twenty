import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddWorkspaceTrashRetention1760356369619
  implements MigrationInterface
{
  name = 'AddWorkspaceTrashRetention1760356369619';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD "trashRetentionDays" integer NOT NULL DEFAULT '14'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" DROP COLUMN "trashRetentionDays"`,
    );
  }
}

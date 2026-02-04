import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddSuspendedAtColumnOnWorkspaceTable1770198374736
  implements MigrationInterface
{
  name = 'AddSuspendedAtColumnOnWorkspaceTable1770198374736';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD "suspendedAt" TIMESTAMP WITH TIME ZONE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" DROP COLUMN "suspendedAt"`,
    );
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class WorkspaceEntityDefaultMicrosoftAuthEnabled1737630672873
  implements MigrationInterface
{
  name = 'WorkspaceEntityDefaultMicrosoftAuthEnabled1737630672873';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ALTER COLUMN "isMicrosoftAuthEnabled" SET DEFAULT true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ALTER COLUMN "isMicrosoftAuthEnabled" SET DEFAULT false`,
    );
  }
}

import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddWorkspaceEventLogRetention1770051000000
  implements MigrationInterface
{
  name = 'AddWorkspaceEventLogRetention1770051000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Default 730 days = 2 years retention for event logs
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD "eventLogRetentionDays" integer NOT NULL DEFAULT '730'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" DROP COLUMN "eventLogRetentionDays"`,
    );
  }
}


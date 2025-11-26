import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddSystemRoleToAgentMessage1764210000000
  implements MigrationInterface
{
  name = 'AddSystemRoleToAgentMessage1764210000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TYPE "core"."agentMessage_role_enum"
      ADD VALUE IF NOT EXISTS 'system'
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // PostgreSQL doesn't support removing enum values
    // We would need to recreate the enum type to remove the value
    // which is more complex and risky, so we leave it as is
  }
}

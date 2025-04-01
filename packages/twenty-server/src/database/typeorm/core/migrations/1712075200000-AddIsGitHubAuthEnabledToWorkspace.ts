import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsGitHubAuthEnabledToWorkspace1712075200000
  implements MigrationInterface
{
  name = 'AddIsGitHubAuthEnabledToWorkspace1712075200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD "isGitHubAuthEnabled" boolean NOT NULL DEFAULT true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" DROP COLUMN "isGitHubAuthEnabled"`,
    );
  }
}
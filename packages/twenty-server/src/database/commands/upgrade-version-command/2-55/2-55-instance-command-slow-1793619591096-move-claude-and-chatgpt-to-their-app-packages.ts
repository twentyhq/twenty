import { type DataSource, type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

const SOURCE_PACKAGE_BY_UNIVERSAL_IDENTIFIER = {
  '3e0bda4b-fb1d-42bd-bab3-03b66698e6ff': '@twentyhq/claude',
  '6e58bb83-49dc-4d4d-ae82-662890eda505': '@twentyhq/chatgpt',
};

// The server used to seed these as OAuth-only registrations; the catalog sync now owns them, and only updates npm ones
@RegisteredInstanceCommand('2.55.0', 1793619591096, { type: 'slow' })
export class MoveClaudeAndChatGptToTheirAppPackagesSlowInstanceCommand
  implements SlowInstanceCommand
{
  async runDataMigration(dataSource: DataSource): Promise<void> {
    for (const [universalIdentifier, sourcePackage] of Object.entries(
      SOURCE_PACKAGE_BY_UNIVERSAL_IDENTIFIER,
    )) {
      await dataSource.query(
        `UPDATE "core"."applicationRegistration"
        SET "sourceType" = 'npm', "sourcePackage" = $2
        WHERE "universalIdentifier" = $1
          AND "sourceType" = 'oauth-only'
          AND "workspaceId" IS NULL`,
        [universalIdentifier, sourcePackage],
      );
    }
  }

  public async up(_queryRunner: QueryRunner): Promise<void> {}

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const [universalIdentifier, sourcePackage] of Object.entries(
      SOURCE_PACKAGE_BY_UNIVERSAL_IDENTIFIER,
    )) {
      await queryRunner.query(
        `UPDATE "core"."applicationRegistration"
        SET "sourceType" = 'oauth-only', "sourcePackage" = NULL
        WHERE "universalIdentifier" = $1
          AND "sourceType" = 'npm'
          AND "sourcePackage" = $2`,
        [universalIdentifier, sourcePackage],
      );
    }
  }
}

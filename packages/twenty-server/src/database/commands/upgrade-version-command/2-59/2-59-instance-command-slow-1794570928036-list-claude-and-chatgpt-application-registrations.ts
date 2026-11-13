import { type DataSource, type QueryRunner } from 'typeorm';

import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { MARKETPLACE_CATALOG_CACHE_ENTITY_ID } from 'src/engine/core-modules/application/application-marketplace/constants/marketplace-apps-cache.constant';
import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

const OFFICIAL_OAUTH_CLIENT_APPLICATIONS = [
  {
    universalIdentifier: '20202020-b759-4b27-9593-4d075aea79ed',
    sourcePackage: '@twentyhq/claude',
  },
  {
    universalIdentifier: '20202020-2cef-4d6c-9c88-05b40177ce9e',
    sourcePackage: '@twentyhq/chatgpt',
  },
];

@RegisteredInstanceCommand('2.59.0', 1794570928036, { type: 'slow' })
export class ListClaudeAndChatgptApplicationRegistrationsSlowInstanceCommand
  implements SlowInstanceCommand
{
  constructor(
    private readonly coreEntityCacheService: CoreEntityCacheService,
  ) {}

  async runDataMigration(dataSource: DataSource): Promise<void> {
    for (const {
      universalIdentifier,
      sourcePackage,
    } of OFFICIAL_OAUTH_CLIENT_APPLICATIONS) {
      await dataSource.query(
        `UPDATE "core"."applicationRegistration"
         SET "isListed" = true
         WHERE "isListed" = false
           AND "universalIdentifier" = $1
           AND "sourcePackage" = $2
           AND "sourceType" = 'npm'`,
        [universalIdentifier, sourcePackage],
      );
    }

    await this.coreEntityCacheService.invalidate(
      'marketplaceCatalog',
      MARKETPLACE_CATALOG_CACHE_ENTITY_ID,
    );
  }

  public async up(_queryRunner: QueryRunner): Promise<void> {
    return;
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    return;
  }
}

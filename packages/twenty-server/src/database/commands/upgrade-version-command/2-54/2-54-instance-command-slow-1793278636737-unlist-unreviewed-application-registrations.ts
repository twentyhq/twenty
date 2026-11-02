import { type DataSource, type QueryRunner } from 'typeorm';

import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { MARKETPLACE_CATALOG_CACHE_ENTITY_ID } from 'src/engine/core-modules/application/application-marketplace/constants/marketplace-apps-cache.constant';
import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

// Being listed now means the app passed the marketplace review; isVetted is dropped one release later
@RegisteredInstanceCommand('2.54.0', 1793278636737, { type: 'slow' })
export class UnlistUnreviewedApplicationRegistrationsSlowInstanceCommand
  implements SlowInstanceCommand
{
  constructor(
    private readonly coreEntityCacheService: CoreEntityCacheService,
  ) {}

  async runDataMigration(dataSource: DataSource): Promise<void> {
    await dataSource.query(
      `UPDATE "core"."applicationRegistration"
       SET "isListed" = false
       WHERE "isListed" = true
         AND "isVetted" = false
         AND "sourceType" = 'npm'`,
    );

    await this.coreEntityCacheService.invalidate(
      'marketplaceCatalog',
      MARKETPLACE_CATALOG_CACHE_ENTITY_ID,
    );
  }

  public async up(_queryRunner: QueryRunner): Promise<void> {
    return;
  }

  // Not reverted: unlisted rows cannot be told apart from ones an admin unlisted
  public async down(_queryRunner: QueryRunner): Promise<void> {
    return;
  }
}

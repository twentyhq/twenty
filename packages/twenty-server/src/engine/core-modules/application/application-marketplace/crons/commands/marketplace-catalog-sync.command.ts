import { Command, CommandRunner } from 'nest-commander';

import { MarketplaceCatalogSyncService } from 'src/engine/core-modules/application/application-marketplace/marketplace-catalog-sync.service';

@Command({
  name: 'marketplace:catalog-sync',
  description: 'Sync the marketplace catalog into ApplicationRegistration',
})
export class MarketplaceCatalogSyncCommand extends CommandRunner {
  constructor(
    private readonly marketplaceCatalogSyncService: MarketplaceCatalogSyncService,
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.marketplaceCatalogSyncService.syncCatalog();
  }
}

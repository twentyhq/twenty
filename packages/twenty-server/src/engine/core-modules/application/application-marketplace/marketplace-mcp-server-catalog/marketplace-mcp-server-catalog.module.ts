import { Module } from '@nestjs/common';

import { MarketplaceMcpServerCatalogService } from 'src/engine/core-modules/application/application-marketplace/marketplace-mcp-server-catalog/marketplace-mcp-server-catalog.service';

@Module({
  providers: [MarketplaceMcpServerCatalogService],
  exports: [MarketplaceMcpServerCatalogService],
})
export class MarketplaceMcpServerCatalogModule {}

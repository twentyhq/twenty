import { Module } from '@nestjs/common';

import { InventoryService } from 'src/modules/inventory/services/inventory.service';

@Module({
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}

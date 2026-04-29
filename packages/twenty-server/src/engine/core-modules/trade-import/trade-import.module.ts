import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchaseOrderEntity, ShipmentEntity, CustomsEntryEntity, LandedCostEntity } from './trade-import.entity';
import { TradeImportService } from './trade-import.service';

@Module({
  imports: [TypeOrmModule.forFeature([PurchaseOrderEntity, ShipmentEntity, CustomsEntryEntity, LandedCostEntity])],
  providers: [TradeImportService],
  exports: [TradeImportService],
})
export class TradeImportModule {}

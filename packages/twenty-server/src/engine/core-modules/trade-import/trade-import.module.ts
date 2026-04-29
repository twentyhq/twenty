import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchaseOrderEntity, ShipmentEntity, CustomsEntryEntity, LandedCostEntity } from './trade-import.entity';
import { TradeImportService } from './trade-import.service';
import { TradeImportResolver } from './trade-import.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([PurchaseOrderEntity, ShipmentEntity, CustomsEntryEntity, LandedCostEntity])],
  providers: [TradeImportService, TradeImportResolver],
  exports: [TradeImportService],
})
export class TradeImportModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchaseRequestEntity, RFQEntity, VendorScorecardEntity } from './procurement.entity';
import { ProcurementService } from './procurement.service';
import { ProcurementResolver } from './procurement.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([PurchaseRequestEntity, RFQEntity, VendorScorecardEntity])],
  providers: [ProcurementService, ProcurementResolver],
  exports: [ProcurementService],
})
export class ProcurementModule {}

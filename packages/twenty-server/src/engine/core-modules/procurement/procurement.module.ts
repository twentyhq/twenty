import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchaseRequestEntity, RFQEntity, VendorScorecardEntity } from './procurement.entity';
import { ProcurementService } from './procurement.service';

@Module({
  imports: [TypeOrmModule.forFeature([PurchaseRequestEntity, RFQEntity, VendorScorecardEntity])],
  providers: [ProcurementService],
  exports: [ProcurementService],
})
export class ProcurementModule {}

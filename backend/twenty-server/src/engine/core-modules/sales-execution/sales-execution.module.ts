import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesTerritoryEntity, SalesQuotaEntity } from './territory.entity';
import { SalesDealBlueprintEntity } from './deal-operations.entity';
import { DealOperationsService } from './deal-operations.service';
import { SalesExecutionService } from './territory.service';

@Module({
  imports: [TypeOrmModule.forFeature([SalesTerritoryEntity, SalesQuotaEntity, SalesDealBlueprintEntity])],
  providers: [SalesExecutionService, DealOperationsService],
  exports: [SalesExecutionService, DealOperationsService],
})
export class SalesExecutionModule {}

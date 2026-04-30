import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesTerritoryEntity, SalesQuotaEntity } from './territory.entity';
import { SalesDealBlueprintEntity } from './deal-operations.entity';
import { DealOperationsService } from './deal-operations.service';
import { SalesExecutionService } from './territory.service';
import { SalesExecutionResolver } from './sales-execution.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([SalesTerritoryEntity, SalesQuotaEntity, SalesDealBlueprintEntity])],
  providers: [SalesExecutionService, DealOperationsService, SalesExecutionResolver],
  exports: [SalesExecutionService, DealOperationsService],
})
export class SalesExecutionModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesTerritoryEntity, SalesQuotaEntity } from './territory.entity';
import { SalesExecutionService } from './territory.service';

@Module({
  imports: [TypeOrmModule.forFeature([SalesTerritoryEntity, SalesQuotaEntity])],
  providers: [SalesExecutionService],
  exports: [SalesExecutionService],
})
export class SalesExecutionModule {}
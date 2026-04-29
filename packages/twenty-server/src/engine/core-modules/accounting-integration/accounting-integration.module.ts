import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  AccountingConnectionEntity, AccountingSyncLogEntity, TaxRuleEntity,
  RevenueRecognitionEntity, SalesCommissionEntity,
} from './accounting-integration.entity';
import { AccountingIntegrationService } from './accounting-integration.service';

@Module({
  imports: [TypeOrmModule.forFeature([
    AccountingConnectionEntity, AccountingSyncLogEntity, TaxRuleEntity,
    RevenueRecognitionEntity, SalesCommissionEntity,
  ])],
  providers: [AccountingIntegrationService],
  exports: [AccountingIntegrationService],
})
export class AccountingIntegrationModule {}

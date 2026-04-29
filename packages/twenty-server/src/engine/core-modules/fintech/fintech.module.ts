import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmbeddedPaymentEntity, ElectronicInvoiceEntity, PartnerChannelEntity, RevenueReconciliationEntity } from './fintech.entity';
import { FintechService } from './fintech.service';

@Module({
  imports: [TypeOrmModule.forFeature([EmbeddedPaymentEntity, ElectronicInvoiceEntity, PartnerChannelEntity, RevenueReconciliationEntity])],
  providers: [FintechService],
  exports: [FintechService],
})
export class FintechModule {}

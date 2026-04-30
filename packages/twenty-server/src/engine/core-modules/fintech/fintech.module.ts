import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmbeddedPaymentEntity, ElectronicInvoiceEntity, PartnerChannelEntity, RevenueReconciliationEntity } from './fintech.entity';
import { FintechService } from './fintech.service';
import { FintechResolver } from './fintech.resolver';
import { FintechController } from './fintech.controller';

@Module({
  imports: [TypeOrmModule.forFeature([EmbeddedPaymentEntity, ElectronicInvoiceEntity, PartnerChannelEntity, RevenueReconciliationEntity])],
  controllers: [FintechController],
  providers: [FintechService, FintechResolver],
  exports: [FintechService],
})
export class FintechModule {}

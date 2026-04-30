import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoiceEntity, PaymentEntity, DisputeEntity, DunningSequenceEntity, PaymentPromiseEntity } from './accounts-receivable.entity';
import { AccountsReceivableService } from './accounts-receivable.service';
import { PortalAccessEntity, AutopayEntity, EarlyPaymentDiscountEntity, CollectionScoreEntity } from './customer-portal.entity';
import { CustomerPortalService } from './customer-portal.service';
import { AccountsReceivableController } from './accounts-receivable.controller';

@Module({
  imports: [TypeOrmModule.forFeature([
    InvoiceEntity, PaymentEntity, DisputeEntity, DunningSequenceEntity, PaymentPromiseEntity,
    PortalAccessEntity, AutopayEntity, EarlyPaymentDiscountEntity, CollectionScoreEntity,
  ])],
  controllers: [AccountsReceivableController],
  providers: [AccountsReceivableService, CustomerPortalService],
  exports: [AccountsReceivableService, CustomerPortalService],
})
export class AccountsReceivableModule {}

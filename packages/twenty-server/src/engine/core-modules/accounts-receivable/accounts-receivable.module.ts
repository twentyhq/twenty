import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoiceEntity, PaymentEntity, DisputeEntity, DunningSequenceEntity, PaymentPromiseEntity } from './accounts-receivable.entity';
import { AccountsReceivableService } from './accounts-receivable.service';
import { PortalAccessEntity, AutopayEntity, EarlyPaymentDiscountEntity, CollectionScoreEntity } from './customer-portal.entity';
import { CustomerPortalService } from './customer-portal.service';

@Module({
  imports: [TypeOrmModule.forFeature([
    InvoiceEntity, PaymentEntity, DisputeEntity, DunningSequenceEntity, PaymentPromiseEntity,
    PortalAccessEntity, AutopayEntity, EarlyPaymentDiscountEntity, CollectionScoreEntity,
  ])],
  providers: [AccountsReceivableService, CustomerPortalService],
  exports: [AccountsReceivableService, CustomerPortalService],
})
export class AccountsReceivableModule {}

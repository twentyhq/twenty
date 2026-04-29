import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ECommerceProductEntity, ECommerceOrderEntity, AbandonedCartEntity, ECommerceSubscriptionEntity, LoyaltyMemberEntity, BrowseEventEntity } from './ecommerce.entity';
import { ECommerceService } from './ecommerce.service';

@Module({
  imports: [TypeOrmModule.forFeature([ECommerceProductEntity, ECommerceOrderEntity, AbandonedCartEntity, ECommerceSubscriptionEntity, LoyaltyMemberEntity, BrowseEventEntity])],
  providers: [ECommerceService],
  exports: [ECommerceService],
})
export class ECommerceModule {}

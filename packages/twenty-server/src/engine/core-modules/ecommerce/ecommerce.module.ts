import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ECommerceProductEntity, ECommerceOrderEntity, AbandonedCartEntity, ECommerceSubscriptionEntity, LoyaltyMemberEntity, BrowseEventEntity, ProductReviewEntity } from './ecommerce.entity';
import { ECommerceService } from './ecommerce.service';
import { ECommerceResolver } from './ecommerce.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([ECommerceProductEntity, ECommerceOrderEntity, AbandonedCartEntity, ECommerceSubscriptionEntity, LoyaltyMemberEntity, BrowseEventEntity, ProductReviewEntity])],
  providers: [ECommerceService, ECommerceResolver],
  exports: [ECommerceService],
})
export class ECommerceModule {}

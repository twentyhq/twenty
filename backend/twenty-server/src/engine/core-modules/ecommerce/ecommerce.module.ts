import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ECommerceProductEntity, ECommerceOrderEntity, AbandonedCartEntity, ECommerceSubscriptionEntity, LoyaltyMemberEntity, BrowseEventEntity, ProductReviewEntity } from './ecommerce.entity';
import { ECommerceService } from './ecommerce.service';
import { ECommerceResolver } from './ecommerce.resolver';
import { ECommerceController } from './ecommerce.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ECommerceProductEntity, ECommerceOrderEntity, AbandonedCartEntity, ECommerceSubscriptionEntity, LoyaltyMemberEntity, BrowseEventEntity, ProductReviewEntity])],
  controllers: [ECommerceController],
  providers: [ECommerceService, ECommerceResolver],
  exports: [ECommerceService],
})
export class ECommerceModule {}

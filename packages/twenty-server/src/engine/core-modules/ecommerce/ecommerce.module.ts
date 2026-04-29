import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ECommerceProductEntity, ECommerceOrderEntity, AbandonedCartEntity, ECommerceSubscriptionEntity, LoyaltyMemberEntity, BrowseEventEntity } from './ecommerce.entity';
import { ECommerceService } from './ecommerce.service';
import { ECommerceResolver } from './ecommerce.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([ECommerceProductEntity, ECommerceOrderEntity, AbandonedCartEntity, ECommerceSubscriptionEntity, LoyaltyMemberEntity, BrowseEventEntity])],
  providers: [ECommerceService, ECommerceResolver],
  exports: [ECommerceService],
})
export class ECommerceModule {}

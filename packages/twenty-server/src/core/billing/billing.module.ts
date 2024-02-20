import { Module } from '@nestjs/common';

import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { BillingSubscription } from 'src/core/billing/entities/billing-subscription.entity';
import { BillingProduct } from 'src/core/billing/entities/billing-product.entity';

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [
        NestjsQueryTypeOrmModule.forFeature(
          [BillingSubscription, BillingProduct],
          'core',
        ),
      ],
    }),
  ],
})
export class BillingModule {}

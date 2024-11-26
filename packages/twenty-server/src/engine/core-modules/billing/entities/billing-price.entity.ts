import { Field } from '@nestjs/graphql';

import Stripe from 'stripe';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { BillingProduct } from 'src/engine/core-modules/billing/entities/billing-product.entity';
import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { BillingUsageType } from 'src/engine/core-modules/billing/enums/billing-usage-type.enum';

@Entity({ name: 'billingPrice', schema: 'core' })
@Unique('IndexOnProductIdAndStripePriceIdUnique', [
  'productId',
  'stripePriceId',
])
export class BillingPrice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true, type: 'timestamptz' })
  deletedAt?: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ nullable: false })
  stripePriceId: string;

  @Column({ nullable: false })
  active: boolean;

  @Field(() => BillingUsageType)
  @Column({
    type: 'enum',
    enum: Object.values(BillingUsageType),
    nullable: false,
  })
  usageType: BillingUsageType;

  @Field(() => SubscriptionInterval, { nullable: true })
  @Column({
    type: 'enum',
    enum: Object.values(SubscriptionInterval),
    nullable: true,
  })
  interval: Stripe.Price.Recurring.Interval;

  @Column({ nullable: false })
  productId: string;

  @Column({ nullable: false })
  stripeProductId: string;

  @ManyToOne(
    () => BillingProduct,
    (billingProduct) => billingProduct.billingPrices,
    {
      onDelete: 'CASCADE',
    },
  )
  billingProduct: Relation<BillingProduct>;
}

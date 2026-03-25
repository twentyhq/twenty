/* @license Enterprise */

import { Field } from '@nestjs/graphql';

import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';

import type Stripe from 'stripe';

import { BillingMeterEntity } from 'src/engine/core-modules/billing/entities/billing-meter.entity';
import { BillingProductEntity } from 'src/engine/core-modules/billing/entities/billing-product.entity';
import { BillingPriceBillingScheme } from 'src/engine/core-modules/billing/enums/billing-price-billing-scheme.enum';
import { BillingPriceTaxBehavior } from 'src/engine/core-modules/billing/enums/billing-price-tax-behavior.enum';
import { BillingPriceType } from 'src/engine/core-modules/billing/enums/billing-price-type.enum';
import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { BillingUsageType } from 'src/engine/core-modules/billing/enums/billing-usage-type.enum';

@Entity({ name: 'billingPrice', schema: 'core' })
export class BillingPriceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true, type: 'timestamptz' })
  deletedAt?: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ nullable: false, unique: true })
  stripePriceId: string;

  @Column({ nullable: false })
  active: boolean;

  @Column({ nullable: false })
  stripeProductId: string;

  @Column({ nullable: false })
  currency: string;

  @Column({ nullable: true, type: 'text' })
  nickname: string | null;

  @Column({
    nullable: false,
    type: 'enum',
    enum: Object.values(BillingPriceTaxBehavior),
  })
  taxBehavior: BillingPriceTaxBehavior;

  @Column({
    nullable: false,
    type: 'enum',
    enum: Object.values(BillingPriceType),
  })
  type: BillingPriceType;

  @Column({
    nullable: false,
    type: 'enum',
    enum: Object.values(BillingPriceBillingScheme),
  })
  billingScheme: BillingPriceBillingScheme;

  @Column({ nullable: true, type: 'jsonb' })
  currencyOptions: Stripe.Price.CurrencyOptions | null;

  @Column({ nullable: true, type: 'jsonb' })
  tiers: Stripe.Price.Tier[] | null;

  @Column({ nullable: true, type: 'jsonb' })
  recurring: Stripe.Price.Recurring | null;

  @Column({ nullable: true, type: 'jsonb' })
  transformQuantity: Stripe.Price.TransformQuantity | null;

  @Column({ nullable: true, type: 'text' })
  unitAmountDecimal: string | null;

  @Column({ nullable: true, type: 'numeric' })
  unitAmount: number | null;

  @Column({ nullable: true, type: 'text' })
  stripeMeterId: string | null;

  @Field(() => BillingUsageType)
  @Column({
    type: 'enum',
    enum: Object.values(BillingUsageType),
    nullable: false,
  })
  usageType: BillingUsageType;

  @Field(() => SubscriptionInterval)
  @Column({
    type: 'enum',
    enum: Object.values(SubscriptionInterval),
  })
  interval: SubscriptionInterval;

  @ManyToOne(
    () => BillingProductEntity,
    (billingProduct) => billingProduct.billingPrices,
    {
      onDelete: 'CASCADE',
      nullable: true,
    },
  )
  @JoinColumn({
    referencedColumnName: 'stripeProductId',
    name: 'stripeProductId',
  })
  billingProduct: Relation<BillingProductEntity> | null;

  @ManyToOne(
    () => BillingMeterEntity,
    (billingMeter) => billingMeter.billingPrices,
    {
      nullable: true,
    },
  )
  @JoinColumn({
    referencedColumnName: 'stripeMeterId',
    name: 'stripeMeterId',
  })
  billingMeter: Relation<BillingMeterEntity> | null;
}

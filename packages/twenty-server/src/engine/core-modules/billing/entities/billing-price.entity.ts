import { Field } from '@nestjs/graphql';

import Stripe from 'stripe';
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

import { BillingMeter } from 'src/engine/core-modules/billing/entities/billing-meter.entity';
import { BillingProduct } from 'src/engine/core-modules/billing/entities/billing-product.entity';
import { BillingPriceBillingScheme } from 'src/engine/core-modules/billing/enums/billing-price-billing-scheme.enum';
import { BillingPriceTaxBehavior } from 'src/engine/core-modules/billing/enums/billing-price-tax-behavior.enum';
import { BillingPriceTiersMode } from 'src/engine/core-modules/billing/enums/billing-price-tiers-mode.enum';
import { BillingPriceType } from 'src/engine/core-modules/billing/enums/billing-price-type.enum';
import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { BillingUsageType } from 'src/engine/core-modules/billing/enums/billing-usage-type.enum';

@Entity({ name: 'billingPrice', schema: 'core' })
export class BillingPrice {
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

  @Column({
    nullable: true,
    type: 'enum',
    enum: Object.values(BillingPriceTiersMode),
  })
  tiersMode: BillingPriceTiersMode | null;

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

  @Field(() => SubscriptionInterval, { nullable: true })
  @Column({
    type: 'enum',
    enum: Object.values(SubscriptionInterval),
    nullable: true,
  })
  interval: SubscriptionInterval | null;

  @ManyToOne(
    () => BillingProduct,
    (billingProduct) => billingProduct.billingPrices,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    referencedColumnName: 'stripeProductId',
    name: 'stripeProductId',
  })
  billingProduct: Relation<BillingProduct>;

  @ManyToOne(() => BillingMeter, (billingMeter) => billingMeter.billingPrices, {
    nullable: true,
  })
  @JoinColumn({
    referencedColumnName: 'stripeMeterId',
    name: 'stripeMeterId',
  })
  billingMeter: Relation<BillingMeter>;
}

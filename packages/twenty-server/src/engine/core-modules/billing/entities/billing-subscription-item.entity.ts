/* @license Enterprise */

import Stripe from 'stripe';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { BillingProduct } from 'src/engine/core-modules/billing/entities/billing-product.entity';
import { BillingSubscription } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { BillingSubscriptionItemMetadata } from 'src/engine/core-modules/billing/types/billing-subscription-item-metadata.type';
@Entity({ name: 'billingSubscriptionItem', schema: 'core' })
@Unique('IndexOnBillingSubscriptionIdAndStripeProductIdUnique', [
  'billingSubscriptionId',
  'stripeProductId',
])
export class BillingSubscriptionItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true, type: 'timestamptz' })
  deletedAt?: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ nullable: false })
  billingSubscriptionId: string;

  @Column({ nullable: true })
  stripeSubscriptionId: string;

  @Column({ nullable: false, type: 'jsonb', default: {} })
  metadata: BillingSubscriptionItemMetadata;

  @Column({ nullable: true, type: 'jsonb' })
  billingThresholds: Stripe.SubscriptionItem.BillingThresholds;

  @ManyToOne(
    () => BillingSubscription,
    (billingSubscription) => billingSubscription.billingSubscriptionItems,
    {
      onDelete: 'CASCADE',
    },
  )
  billingSubscription: Relation<BillingSubscription>;

  @ManyToOne(() => BillingProduct)
  @JoinColumn({
    name: 'stripeProductId',
    referencedColumnName: 'stripeProductId',
  })
  billingProduct: Relation<BillingProduct>;

  @Column({ nullable: false })
  stripeProductId: string;

  @Column({ nullable: false })
  stripePriceId: string;

  @Column({ nullable: false, unique: true })
  stripeSubscriptionItemId: string;

  @Column({ nullable: true, type: 'numeric' })
  quantity: number | null;

  @Column({ type: 'boolean', default: false })
  hasReachedCurrentPeriodCap: boolean;
}

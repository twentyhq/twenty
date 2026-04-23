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

import { BillingProductEntity } from 'src/engine/core-modules/billing/entities/billing-product.entity';
import { BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { BillingSubscriptionItemMetadata } from 'src/engine/core-modules/billing/types/billing-subscription-item-metadata.type';
@Entity({ name: 'billingSubscriptionItem', schema: 'core' })
@Unique(
  'IDX_BILLING_SUBSCRIPTION_ITEM_BILLING_SUBSCRIPTION_ID_STRIPE_PRODUCT_ID_UNIQUE',
  ['billingSubscriptionId', 'stripeProductId'],
)
export class BillingSubscriptionItemEntity {
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
    () => BillingSubscriptionEntity,
    (billingSubscription) => billingSubscription.billingSubscriptionItems,
    {
      onDelete: 'CASCADE',
    },
  )
  billingSubscription: Relation<BillingSubscriptionEntity>;

  @ManyToOne(() => BillingProductEntity)
  @JoinColumn({
    name: 'stripeProductId',
    referencedColumnName: 'stripeProductId',
  })
  billingProduct: Relation<BillingProductEntity>;

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

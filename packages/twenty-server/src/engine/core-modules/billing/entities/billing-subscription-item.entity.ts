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

import { BillingSubscription } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
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
  metadata: Stripe.Metadata;

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

  @Column({ nullable: false })
  stripeProductId: string;

  @Column({ nullable: false })
  stripePriceId: string;

  @Column({ nullable: false, unique: true })
  stripeSubscriptionItemId: string;

  @Column({ nullable: true, type: 'numeric' })
  quantity: number | null;
}

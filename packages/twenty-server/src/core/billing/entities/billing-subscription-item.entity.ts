import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { BillingSubscription } from 'src/core/billing/entities/billing-subscription.entity';

@Entity({ name: 'billingSubscriptionItem', schema: 'core' })
export class BillingSubscriptionItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  deletedAt?: Date;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  @Column({ nullable: false })
  billingSubscriptionId: string;

  @ManyToOne(
    () => BillingSubscription,
    (billingSubscription) => billingSubscription.billingSubscriptionItems,
    {
      onDelete: 'CASCADE',
    },
  )
  billingSubscription: BillingSubscription;

  @Column({ nullable: false })
  stripeProductId: string;

  @Column({ nullable: false })
  stripePriceId: string;

  @Column({ nullable: false })
  quantity: number;
}

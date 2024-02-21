import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import Stripe from 'stripe';

import { Workspace } from 'src/core/workspace/workspace.entity';
import { BillingSubscriptionItem } from 'src/core/billing/entities/billing-subscription-item.entity';

@Entity({ name: 'billingSubscription', schema: 'core' })
export class BillingSubscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  deletedAt?: Date;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  @OneToOne(() => Workspace, (workspace) => workspace.billingSubscription, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  workspace: Workspace;

  @Column({ nullable: false, type: 'uuid' })
  workspaceId: string;

  @Column({ unique: true, nullable: false })
  stripeCustomerId: string;

  @Column({ unique: true, nullable: false })
  stripeSubscriptionId: string;

  @Column({ nullable: false })
  status: Stripe.Subscription.Status;

  @OneToMany(
    () => BillingSubscriptionItem,
    (billingSubscriptionItem) => billingSubscriptionItem.billingSubscription,
  )
  billingSubscriptionItems: BillingSubscriptionItem[];
}

import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import Stripe from 'stripe';

import { Workspace } from 'src/core/workspace/workspace.entity';
import { BillingProduct } from 'src/core/billing/entities/billing-product.entity';

@Entity({ name: 'billingSubscription', schema: 'core' })
export class BillingSubscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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
    () => BillingProduct,
    (billingProduct) => billingProduct.billingSubscription,
  )
  billingProducts: BillingProduct[];
}

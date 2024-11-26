import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { BillingSubscription } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

@Entity({ name: 'billingCustomer', schema: 'core' })
@Unique('IndexOnWorkspaceIdAndStripeCustomerIdUnique', [
  'workspaceId',
  'stripeCustomerId',
])
export class BillingCustomer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true, type: 'timestamptz' })
  deletedAt?: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @JoinColumn()
  workspace: Relation<Workspace>;

  @Column({ nullable: false })
  stripeCustomerId: string;

  @Column({ nullable: false })
  workspaceId: string;

  @OneToMany(
    () => BillingSubscription,
    (billingSubscription) => billingSubscription.billingCustomer,
  )
  billingSubscriptions: Relation<BillingSubscription[]>;
}

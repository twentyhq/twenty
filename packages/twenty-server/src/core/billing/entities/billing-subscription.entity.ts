import { Field, ID, ObjectType } from '@nestjs/graphql';

import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IDField } from '@ptc-org/nestjs-query-graphql';
import Stripe from 'stripe';

import { Workspace } from 'src/core/workspace/workspace.entity';
import { BillingProduct } from 'src/core/billing/entities/billing-product.entity';

@Entity({ name: 'billingSubscription', schema: 'core' })
@ObjectType('BillingSubscription')
export class BillingSubscription {
  @IDField(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Workspace, (workspace) => workspace.billingSubscription, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  workspace: Workspace;

  @Field()
  @Column({ nullable: false, type: 'uuid' })
  workspaceId: string;

  @Field()
  @Column({ unique: true, nullable: false })
  stripeCustomerId: string;

  @Field()
  @Column({ unique: true, nullable: false })
  stripeSubscriptionId: string;

  @Field()
  @Column({ nullable: false })
  status: Stripe.Subscription.Status;

  @OneToMany(
    () => BillingProduct,
    (billingProduct) => billingProduct.billingSubscription,
  )
  billingProducts: BillingProduct[];
}

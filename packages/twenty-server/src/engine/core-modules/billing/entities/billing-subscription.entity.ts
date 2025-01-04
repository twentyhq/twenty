import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';
import Stripe from 'stripe';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { BillingCustomer } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { BillingSubscriptionItem } from 'src/engine/core-modules/billing/entities/billing-subscription-item.entity';
import { BillingSubscriptionCollectionMethod } from 'src/engine/core-modules/billing/enums/billing-subscription-collection-method.enum';
import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';

registerEnumType(SubscriptionStatus, { name: 'SubscriptionStatus' });
registerEnumType(SubscriptionInterval, { name: 'SubscriptionInterval' });

@Entity({ name: 'billingSubscription', schema: 'core' })
@Index('IndexOnActiveSubscriptionPerWorkspace', ['workspaceId'], {
  unique: true,
  where: `status IN ('trialing', 'active', 'past_due')`,
})
@ObjectType('BillingSubscription')
export class BillingSubscription {
  @IDField(() => UUIDScalarType)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true, type: 'timestamptz' })
  deletedAt?: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ nullable: false, type: 'uuid' })
  workspaceId: string;

  @Column({ nullable: false })
  stripeCustomerId: string;

  @Column({ unique: true, nullable: false })
  stripeSubscriptionId: string;

  @Field(() => SubscriptionStatus)
  @Column({
    type: 'enum',
    enum: Object.values(SubscriptionStatus),
    nullable: false,
  })
  status: SubscriptionStatus;

  @Field(() => SubscriptionInterval, { nullable: true })
  @Column({
    type: 'enum',
    enum: Object.values(SubscriptionInterval),
    nullable: true,
  })
  interval: Stripe.Price.Recurring.Interval;

  @OneToMany(
    () => BillingSubscriptionItem,
    (billingSubscriptionItem) => billingSubscriptionItem.billingSubscription,
  )
  billingSubscriptionItems: Relation<BillingSubscriptionItem[]>;

  @ManyToOne(
    () => BillingCustomer,
    (billingCustomer) => billingCustomer.billingSubscriptions,
    {
      nullable: false,
      onDelete: 'CASCADE',
      createForeignKeyConstraints: false,
    },
  )
  @JoinColumn({
    referencedColumnName: 'stripeCustomerId',
    name: 'stripeCustomerId',
  })
  billingCustomer: Relation<BillingCustomer>;

  @Column({ nullable: false, default: false })
  cancelAtPeriodEnd: boolean;

  @Column({ nullable: false, default: 'USD' })
  currency: string;

  @Column({
    nullable: false,
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  currentPeriodEnd: Date;

  @Column({
    nullable: false,
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  currentPeriodStart: Date;

  @Column({ nullable: false, type: 'jsonb', default: {} })
  metadata: Stripe.Metadata;

  @Column({ nullable: true, type: 'timestamptz' })
  cancelAt: Date | null;

  @Column({
    nullable: true,
    type: 'timestamptz',
  })
  canceledAt: Date | null;

  @Column({ nullable: true, type: 'jsonb' })
  automaticTax: Stripe.Subscription.AutomaticTax | null;

  @Column({ nullable: true, type: 'jsonb' })
  cancellationDetails: Stripe.Subscription.CancellationDetails | null;

  @Column({
    nullable: false,
    type: 'enum',
    enum: Object.values(BillingSubscriptionCollectionMethod),
    default: BillingSubscriptionCollectionMethod.CHARGE_AUTOMATICALLY,
  })
  collectionMethod: BillingSubscriptionCollectionMethod;

  @Column({ nullable: true, type: 'timestamptz' })
  endedAt: Date | null;

  @Column({ nullable: true, type: 'timestamptz' })
  trialStart: Date | null;

  @Column({ nullable: true, type: 'timestamptz' })
  trialEnd: Date | null;
}

import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';
import Stripe from 'stripe';
import {
  Column,
  CreateDateColumn,
  Entity,
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
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

registerEnumType(SubscriptionStatus, { name: 'SubscriptionStatus' });
registerEnumType(SubscriptionInterval, { name: 'SubscriptionInterval' });

@Entity({ name: 'billingSubscription', schema: 'core' })
@ObjectType('BillingSubscription')
export class BillingSubscription {
  @IDField(() => UUIDScalarType)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  static transformTimestampToDate(timestamp: number): Date {
    return new Date(timestamp * 1000);
  }

  @Column({ nullable: true, type: 'timestamptz' })
  deletedAt?: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => Workspace, (workspace) => workspace.billingSubscriptions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  workspace: Relation<Workspace>;

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
      createForeignKeyConstraints: false, //TO DO: when table BillingCustomer populated set to true
      //even if we put this column nullable and we set createForeignKeyConstraints to ture, we are unabled to insert due to constraints
      // right now we save the relation , but when we will have populated BillingCustomer, we will add the contraints
    },
  )
  @JoinColumn({
    referencedColumnName: 'stripeCustomerId',
    name: 'stripeCustomerId',
  })
  billingCustomer: Relation<BillingCustomer>;

  @Column({ nullable: false })
  cancelAtPeriodEnd: boolean;

  @Column({ nullable: false })
  currency: string;

  @Column({ nullable: false, type: 'timestamptz' })
  currentPeriodEnd: Date;

  @Column({ nullable: false, type: 'timestamptz' })
  currentPeriodStart: Date;

  @Column({ nullable: false, type: 'jsonb', default: {} })
  metadata: Stripe.Metadata;

  @Column({ nullable: true, type: 'timestamptz' })
  cancelAt: Date;

  @Column({
    nullable: true,
    type: 'timestamptz',
  })
  canceledAt: Date;

  @Column({ nullable: true, type: 'jsonb', default: {} })
  automaticTax: Stripe.Subscription.AutomaticTax;

  @Column({ nullable: true, type: 'jsonb' })
  cancellationDetails: Stripe.Subscription.CancellationDetails;

  @Column({
    nullable: false,
    type: 'enum',
    enum: Object.values(BillingSubscriptionCollectionMethod),
  })
  collectionMethod: BillingSubscriptionCollectionMethod;

  @Column({ nullable: true, type: 'timestamptz' })
  endedAt: Date;

  @Column({ nullable: true, type: 'timestamptz' })
  trialStart: Date;

  @Column({ nullable: true, type: 'timestamptz' })
  trialEnd: Date;
}

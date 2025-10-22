/* @license Enterprise */

import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';
import graphqlTypeJson from 'graphql-type-json';
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
import { BillingCustomerEntity } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { BillingSubscriptionSchedulePhaseDTO } from 'src/engine/core-modules/billing/dtos/billing-subscription-schedule-phase.dto';
import { BillingSubscriptionItemDTO } from 'src/engine/core-modules/billing/dtos/outputs/billing-subscription-item.output';
import { BillingSubscriptionItemEntity } from 'src/engine/core-modules/billing/entities/billing-subscription-item.entity';
import { BillingSubscriptionCollectionMethod } from 'src/engine/core-modules/billing/enums/billing-subscription-collection-method.enum';
import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';

registerEnumType(SubscriptionStatus, { name: 'SubscriptionStatus' });
registerEnumType(SubscriptionInterval, { name: 'SubscriptionInterval' });

@Entity({ name: 'billingSubscription', schema: 'core' })
@Index('IDX_BILLING_SUBSCRIPTION_WORKSPACE_ID_UNIQUE', ['workspaceId'], {
  unique: true,
  where: `status IN ('trialing', 'active', 'past_due')`,
})
@ObjectType('BillingSubscription')
export class BillingSubscriptionEntity {
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
  interval: SubscriptionInterval;

  @Field(() => [BillingSubscriptionItemDTO], { nullable: true })
  @OneToMany(
    () => BillingSubscriptionItemEntity,
    (billingSubscriptionItem) => billingSubscriptionItem.billingSubscription,
  )
  billingSubscriptionItems: Relation<BillingSubscriptionItemEntity[]>;

  @ManyToOne(
    () => BillingCustomerEntity,
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
  billingCustomer: Relation<BillingCustomerEntity>;

  @Column({ nullable: false, default: false })
  cancelAtPeriodEnd: boolean;

  @Column({ nullable: false, default: 'USD' })
  currency: string;

  @Field(() => Date, { nullable: true })
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

  @Field(() => graphqlTypeJson)
  @Column({ nullable: false, type: 'jsonb', default: {} })
  metadata: Stripe.Metadata;

  @Field(() => [BillingSubscriptionSchedulePhaseDTO])
  @Column({ nullable: false, type: 'jsonb', default: [] })
  phases: Array<BillingSubscriptionSchedulePhaseDTO>;

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

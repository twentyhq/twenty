/* @license Enterprise */

import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';
import GraphQLJSON from 'graphql-type-json';
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
import { BillingSubscriptionItemDTO } from 'src/engine/core-modules/billing/dtos/outputs/billing-subscription-item.output';
import { BillingCharge } from 'src/engine/core-modules/billing/entities/billing-charge.entity';
import { BillingCustomer } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { BillingSubscriptionItem } from 'src/engine/core-modules/billing/entities/billing-subscription-item.entity';
import { BillingPaymentProviders } from 'src/engine/core-modules/billing/enums/billing-payment-providers.enum';
import { BillingSubscriptionCollectionMethod } from 'src/engine/core-modules/billing/enums/billing-subscription-collection-method.enum';
import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';
import { ChargeType } from 'src/engine/core-modules/billing/enums/billint-charge-type.enum';

registerEnumType(SubscriptionStatus, { name: 'SubscriptionStatus' });
registerEnumType(SubscriptionInterval, { name: 'SubscriptionInterval' });
registerEnumType(ChargeType, {
  name: 'ChargeType',
  description: 'The type diffent type of charge for the subscription',
});

@Entity({ name: 'billingSubscription', schema: 'core' })
@Index('IndexOnActiveSubscriptionPerWorkspace', ['workspaceId'], {
  unique: true,
  where: `status IN ('trialing', 'active', 'past_due')`,
})
@ObjectType()
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

  @Column({ nullable: true })
  stripeCustomerId: string;

  @Column({ unique: true, nullable: true })
  stripeSubscriptionId: string;

  @Column({ nullable: true, unique: true })
  interBillingChargeId: string;

  @Field(() => BillingPaymentProviders)
  @Column({
    nullable: false,
    type: 'enum',
    enum: Object.values(BillingPaymentProviders),
    default: BillingPaymentProviders.Stripe,
  })
  provider: BillingPaymentProviders;

  @Field(() => SubscriptionStatus)
  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
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

  @Field(() => ChargeType, { nullable: true })
  @Column({
    type: 'enum',
    enum: Object.values(ChargeType),
    nullable: true,
    default: ChargeType.ONE_TIME,
  })
  chargeType: ChargeType;

  @Field(() => [BillingSubscriptionItemDTO], { nullable: true })
  @OneToMany(
    () => BillingSubscriptionItem,
    (billingSubscriptionItem) => billingSubscriptionItem.billingSubscription,
  )
  billingSubscriptionItems: Relation<BillingSubscriptionItem[]>;

  @OneToMany(
    () => BillingCharge,
    (billingCharge) => billingCharge.billingSubscription,
    {
      nullable: true,
    },
  )
  billingSubscriptionCharges: Relation<BillingCharge[]>;

  @Field(() => String, { nullable: true })
  currentChargeFileLink: string | null;

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

  @Field(() => GraphQLJSON, { nullable: true })
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

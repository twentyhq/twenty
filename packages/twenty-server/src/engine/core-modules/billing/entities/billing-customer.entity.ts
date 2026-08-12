/* @license Enterprise */

import { Field, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
} from 'typeorm';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { BillingEntitlementEntity } from 'src/engine/core-modules/billing/entities/billing-entitlement.entity';
import { BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { bigintColumnTransformer } from 'src/engine/core-modules/billing/utils/bigint-column-transformer.util';
import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/types/workspace-related-entity';

@Entity({ name: 'billingCustomer', schema: 'core' })
@ObjectType('BillingCustomer')
@Index('IDX_BILLING_CUSTOMER_WORKSPACE_ID_UNIQUE', ['workspaceId'], {
  unique: true,
})
export class BillingCustomerEntity extends WorkspaceRelatedEntity {
  @Field(() => UUIDScalarType)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true, type: 'timestamptz' })
  deletedAt?: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ nullable: false, unique: true })
  stripeCustomerId: string;

  @Field(() => Boolean, { nullable: true })
  @Column({ nullable: true, type: 'boolean' })
  hasPaymentMethod: boolean | null;

  @Column({
    type: 'bigint',
    nullable: false,
    default: 0,
    transformer: bigintColumnTransformer,
  })
  creditBalanceMicro: number;

  @OneToMany(
    () => BillingSubscriptionEntity,
    (billingSubscription) => billingSubscription.billingCustomer,
  )
  billingSubscriptions: Relation<BillingSubscriptionEntity[]>;

  @OneToMany(
    () => BillingEntitlementEntity,
    (billingEntitlement) => billingEntitlement.billingCustomer,
  )
  billingEntitlements: Relation<BillingEntitlementEntity[]>;
}

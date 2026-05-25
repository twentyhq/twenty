/* @license Enterprise */

import { ObjectType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';
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
import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/types/workspace-related-entity';

@Entity({ name: 'billingCustomer', schema: 'core' })
@ObjectType('BillingCustomer')
@Index('IDX_BILLING_CUSTOMER_WORKSPACE_ID_UNIQUE', ['workspaceId'], {
  unique: true,
})
export class BillingCustomerEntity extends WorkspaceRelatedEntity {
  @IDField(() => UUIDScalarType)
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

  @Column({
    type: 'bigint',
    nullable: false,
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string | number | null) =>
        typeof value === 'string' ? Number(value) : (value ?? 0),
    },
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

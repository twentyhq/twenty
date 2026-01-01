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
import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/workspace-sync/types/workspace-related-entity';

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

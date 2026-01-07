/* @license Enterprise */

import { Field, ObjectType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { BillingCustomerEntity } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { BillingEntitlementKey } from 'src/engine/core-modules/billing/enums/billing-entitlement-key.enum';
import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/workspace-sync/types/workspace-related-entity';

@Entity({ name: 'billingEntitlement', schema: 'core' })
@ObjectType('BillingEntitlement')
@Unique('IDX_BILLING_ENTITLEMENT_KEY_WORKSPACE_ID_UNIQUE', [
  'key',
  'workspaceId',
])
export class BillingEntitlementEntity extends WorkspaceRelatedEntity {
  @IDField(() => UUIDScalarType)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column({ nullable: false, type: 'text' })
  key: BillingEntitlementKey;

  @Column({ nullable: false })
  stripeCustomerId: string;

  @Field()
  @Column({ nullable: false })
  value: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ nullable: true, type: 'timestamptz' })
  deletedAt?: Date;
  @ManyToOne(
    () => BillingCustomerEntity,
    (billingCustomer) => billingCustomer.billingEntitlements,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  @JoinColumn({
    referencedColumnName: 'stripeCustomerId',
    name: 'stripeCustomerId',
  })
  billingCustomer: Relation<BillingCustomerEntity>;
}

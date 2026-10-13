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

import { ADD_MEMBER_CREDITS_FALLBACK_TO_BILLING_CUSTOMER_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-47/add-member-credits-fallback-to-billing-customer-upgrade-command-name.constant';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { BillingEntitlementEntity } from 'src/engine/core-modules/billing/entities/billing-entitlement.entity';
import { BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { MemberCreditsFallback } from 'src/engine/core-modules/billing/enums/billing-member-credits-fallback.enum';
import { WasIntroducedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/types/workspace-related-entity.type';

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

  // Null means unknown (customer created before the flag existed and not synced yet).
  @Field(() => Boolean, { nullable: true })
  @Column({ nullable: true, type: 'boolean' })
  hasPaymentMethod: boolean | null;

  @Field(() => MemberCreditsFallback)
  @WasIntroducedInUpgrade({
    upgradeCommandName:
      ADD_MEMBER_CREDITS_FALLBACK_TO_BILLING_CUSTOMER_UPGRADE_COMMAND_NAME,
  })
  @Column({
    type: 'varchar',
    nullable: false,
    default: MemberCreditsFallback.WORKSPACE_CREDITS,
  })
  memberCreditsFallback: MemberCreditsFallback;

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

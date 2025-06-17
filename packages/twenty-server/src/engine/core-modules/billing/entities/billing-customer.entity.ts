/* @license Enterprise */

import { ObjectType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';

import {
  InterCustomerType,
  InterCustomerUf,
} from 'src/engine/core-modules/inter/interfaces/charge.interface';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { BillingEntitlement } from 'src/engine/core-modules/billing/entities/billing-entitlement.entity';
import { BillingSubscription } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';

@Entity({ name: 'billingCustomer', schema: 'core' })
@ObjectType()
export class BillingCustomer {
  @IDField(() => UUIDScalarType)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true, type: 'timestamptz' })
  deletedAt?: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ nullable: false, type: 'uuid', unique: true })
  workspaceId: string;

  @Column({ nullable: true, unique: true })
  stripeCustomerId: string;

  @Column({ nullable: true, unique: true })
  interBillingChargeId: string;

  @Column({ nullable: true })
  currentInterBankSlipChargeFilePath: string;

  @Column({ nullable: true })
  name: string;

  @Column({ type: 'enum', enum: InterCustomerType, nullable: true })
  legalEntity: InterCustomerType;

  @Column({ nullable: true })
  document: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  cep: string;

  @Column({ type: 'enum', enum: InterCustomerUf, nullable: true })
  stateUnity: InterCustomerUf;

  @Column({ nullable: true })
  city: string;

  @OneToMany(
    () => BillingSubscription,
    (billingSubscription) => billingSubscription.billingCustomer,
  )
  billingSubscriptions: Relation<BillingSubscription[]>;

  @OneToMany(
    () => BillingEntitlement,
    (billingEntitlement) => billingEntitlement.billingCustomer,
  )
  billingEntitlements: Relation<BillingEntitlement[]>;
}

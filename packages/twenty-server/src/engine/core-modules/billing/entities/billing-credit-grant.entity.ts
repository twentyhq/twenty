/* @license Enterprise */

import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { BillingCreditGrantType } from 'src/engine/core-modules/billing/enums/billing-credit-grant-type.enum';
import { bigintColumnTransformer } from 'src/engine/core-modules/billing/utils/bigint-column-transformer.util';
import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/types/workspace-related-entity.type';

@Entity({ name: 'billingCreditGrant', schema: 'core' })
@Index('IDX_BILLING_CREDIT_GRANT_WORKSPACE_ID_EXPIRES_AT', [
  'workspaceId',
  'expiresAt',
])
export class BillingCreditGrantEntity extends WorkspaceRelatedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: false,
    type: 'bigint',
    transformer: bigintColumnTransformer,
  })
  amountMicro: number;

  @Column({
    nullable: false,
    type: 'enum',
    enum: Object.values(BillingCreditGrantType),
  })
  type: BillingCreditGrantType;

  @Column({ nullable: false, type: 'timestamptz' })
  effectiveAt: Date;

  // A tombstone, not a deadline (except time-boxed grants): a future expiry would depend on the transition running
  @Column({ nullable: true, type: 'timestamptz' })
  expiresAt: Date | null;

  @Column({ nullable: true, type: 'timestamptz' })
  revokedAt: Date | null;

  @Column({ nullable: true, type: 'uuid' })
  revokedByUserId: string | null;

  @Column({ nullable: true, type: 'uuid' })
  grantedByUserId: string | null;

  @Column({ nullable: true, type: 'varchar', length: 500 })
  reason: string | null;

  @Index('IDX_BILLING_CREDIT_GRANT_IDEMPOTENCY_KEY_UNIQUE', { unique: true })
  @Column({ nullable: true, type: 'varchar' })
  idempotencyKey: string | null;

  // Set when this grant carries forward the unspent part of another one.
  @Column({ nullable: true, type: 'uuid' })
  sourceGrantId: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}

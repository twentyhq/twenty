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
import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/types/workspace-related-entity';

const bigintTransformer = {
  to: (value: number) => value,
  from: (value: string | number | null) =>
    typeof value === 'string' ? Number(value) : (value ?? 0),
};

@Entity({ name: 'billingCreditGrant', schema: 'core' })
@Index('IDX_BILLING_CREDIT_GRANT_WORKSPACE_ID_EXPIRES_AT', [
  'workspaceId',
  'expiresAt',
])
export class BillingCreditGrantEntity extends WorkspaceRelatedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'bigint', transformer: bigintTransformer })
  amountMicro: number;

  @Column({
    nullable: false,
    type: 'enum',
    enum: Object.values(BillingCreditGrantType),
  })
  type: BillingCreditGrantType;

  @Column({ nullable: false, type: 'timestamptz' })
  effectiveAt: Date;

  // Always the end of the billing period the grant belongs to. The available
  // credit count is cached in Redis until period end and never recomputed
  // mid-period, so an expiry inside a period would go unnoticed by the only
  // code path that gates usage.
  @Column({ nullable: false, type: 'timestamptz' })
  expiresAt: Date;

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

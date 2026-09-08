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
import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/types/workspace-related-entity';

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

  // A tombstone rather than a deadline: null while the credits are spendable,
  // then the instant they stopped being. Writing a future expiry at grant time
  // would put the balance at the mercy of the period transition running, and a
  // transition that never fires would delete credits nobody spent. Only an
  // operator asking for a time-boxed grant sets one in advance, and that date
  // caps how long the available credit count may stay cached.
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

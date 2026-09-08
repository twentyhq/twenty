/* @license Enterprise */

import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/types/workspace-related-entity';

@Entity({ name: 'billingAppCharge', schema: 'core' })
@Index(
  'IDX_BILLING_APP_CHARGE_IDEMPOTENCY',
  ['workspaceId', 'applicationId', 'idempotencyKey'],
  { unique: true },
)
@Index('IDX_BILLING_APP_CHARGE_PENDING', ['deliveredAt', 'nextAttemptAt'])
export class BillingAppChargeEntity extends WorkspaceRelatedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  applicationId: string;

  @Column({ type: 'varchar', length: 200 })
  idempotencyKey: string;

  @Column({ type: 'varchar', length: 64 })
  requestHash: string;

  // Freeze the event, including its billing period, before acknowledging a charge.
  @Column({ type: 'jsonb' })
  usageRow: Record<string, unknown>;

  @Column({ type: 'timestamptz', nullable: true })
  deliveredAt: Date | null;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  nextAttemptAt: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}

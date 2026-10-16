/* @license Enterprise */

import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';

import { BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/types/workspace-related-entity.type';

@Entity({ name: 'billingSeatChange', schema: 'core' })
@Index('IDX_BILLING_SEAT_CHANGE_WORKSPACE_ID_CHANGED_AT', [
  'workspaceId',
  'changedAt',
])
export class BillingSeatChangeEntity extends WorkspaceRelatedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  billingSubscriptionId: string;

  @ManyToOne(() => BillingSubscriptionEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'billingSubscriptionId' })
  billingSubscription: Relation<BillingSubscriptionEntity>;

  @Column({ type: 'int' })
  previousSeats: number;

  @Column({ type: 'int' })
  seats: number;

  @Column({ type: 'timestamptz' })
  changedAt: Date;

  @Index('IDX_BILLING_SEAT_CHANGE_STRIPE_EVENT_ID_UNIQUE', { unique: true })
  @Column({ type: 'varchar' })
  stripeEventId: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}

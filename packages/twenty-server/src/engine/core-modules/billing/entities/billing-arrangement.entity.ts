/* @license Enterprise */

import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { type BillingArrangementSeatCapMode } from 'src/engine/core-modules/billing/enums/billing-arrangement-seat-cap-mode.enum';
import { type BillingArrangementType } from 'src/engine/core-modules/billing/enums/billing-arrangement-type.enum';
import { nullableBigintColumnTransformer } from 'src/engine/twenty-orm/utils/nullable-bigint-column-transformer.util';

// No foreign keys: arrangements are the history of commercial terms and must
// outlive the workspace and the credit grant or usage limit rows they point to.
@Entity({ name: 'billingArrangement', schema: 'core' })
@Index('IDX_BILLING_ARRANGEMENT_WORKSPACE_ID_TYPE', ['workspaceId', 'type'])
export class BillingArrangementEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'uuid' })
  workspaceId: string;

  @Column({ nullable: false, type: 'varchar' })
  type: BillingArrangementType;

  @Column({ nullable: false, type: 'varchar', length: 100 })
  label: string;

  @Column({ nullable: true, type: 'varchar', length: 500 })
  comment: string | null;

  @Column({ nullable: true, type: 'int' })
  seats: number | null;

  @Column({ nullable: true, type: 'varchar' })
  seatCapMode: BillingArrangementSeatCapMode | null;

  @Column({ nullable: true, type: 'varchar' })
  stripePriceId: string | null;

  @Column({ nullable: true, type: 'varchar' })
  stripeCouponId: string | null;

  @Column({
    nullable: true,
    type: 'bigint',
    transformer: nullableBigintColumnTransformer,
  })
  creditAllowanceMicro: number | null;

  @Column({ nullable: true, type: 'varchar' })
  stripeCreditNoteId: string | null;

  @Column({ nullable: true, type: 'uuid' })
  creditGrantId: string | null;

  @Column({ nullable: true, type: 'uuid' })
  usageLimitId: string | null;

  @Column({ nullable: false, type: 'timestamptz' })
  startsAt: Date;

  @Column({ nullable: true, type: 'timestamptz' })
  endsAt: Date | null;

  @Column({ nullable: true, type: 'timestamptz' })
  revokedAt: Date | null;

  @Column({ nullable: true, type: 'uuid' })
  revokedByUserId: string | null;

  @Column({ nullable: true, type: 'uuid' })
  grantedByUserId: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}

import Stripe from 'stripe';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';

import { BillingPrice } from 'src/engine/core-modules/billing/entities/billing-price.entity';
import { BillingMeterEventTimeWindow } from 'src/engine/core-modules/billing/enums/billing-meter-event-time-window.enum';
import { BillingMeterStatus } from 'src/engine/core-modules/billing/enums/billing-meter-status.enum';

@Entity({ name: 'billingMeter', schema: 'core' })
export class BillingMeter {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true, type: 'timestamptz' })
  deletedAt?: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ nullable: false, unique: true })
  stripeMeterId: string;

  @Column({ nullable: false })
  displayName: string;

  @Column({ nullable: false })
  eventName: string;

  @Column({
    nullable: false,
    type: 'enum',
    enum: Object.values(BillingMeterStatus),
  })
  status: BillingMeterStatus;

  @Column({ nullable: false, type: 'jsonb' })
  customerMapping: Stripe.Billing.Meter.CustomerMapping;

  @Column({
    nullable: true,
    type: 'enum',
    enum: Object.values(BillingMeterEventTimeWindow),
  })
  eventTimeWindow: BillingMeterEventTimeWindow | null;

  @OneToMany(() => BillingPrice, (billingPrice) => billingPrice.billingMeter)
  billingPrices: Relation<BillingPrice[]>;

  @Column({ nullable: false, type: 'jsonb' })
  valueSettings: Stripe.Billing.Meter.ValueSettings;
}

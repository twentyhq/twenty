import { registerEnumType } from '@nestjs/graphql';

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
import { BillingUsageType } from 'src/engine/core-modules/billing/enums/billing-usage-type.enum';
import { BillingProductMetadata } from 'src/engine/core-modules/billing/types/billing-product-metadata.type';
registerEnumType(BillingUsageType, { name: 'BillingUsageType' });
@Entity({ name: 'billingProduct', schema: 'core' })
export class BillingProduct {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true, type: 'timestamptz' })
  deletedAt?: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ nullable: false })
  active: boolean;

  @Column({ nullable: true, type: 'text' })
  description: string | null;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: true, type: 'text' })
  taxCode: string | null;

  @Column({ nullable: false, type: 'jsonb', default: [] })
  images: string[];

  @Column({ nullable: false, type: 'jsonb', default: [] })
  marketingFeatures: Stripe.Product.MarketingFeature[];

  @Column({ nullable: false, unique: true })
  stripeProductId: string;

  @Column({ nullable: true, type: 'text' })
  defaultStripePriceId: string | null;

  @Column({ nullable: false, type: 'jsonb', default: {} })
  metadata: BillingProductMetadata;

  @OneToMany(() => BillingPrice, (billingPrice) => billingPrice.billingProduct)
  billingPrices: Relation<BillingPrice[]>;

  @Column({ nullable: true, type: 'text' })
  unitLabel: string | null;

  @Column({ nullable: true, type: 'text' })
  url: string | null;
}

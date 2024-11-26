import { Field, registerEnumType } from '@nestjs/graphql';

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
import { BillingAvailablePlanKey } from 'src/engine/core-modules/billing/enums/billing-available-plan-key.enum';
import { BillingUsageType } from 'src/engine/core-modules/billing/enums/billing-usage-type.enum';

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

  @Column({ nullable: false })
  stripeProductId: string;

  @Column({ nullable: false })
  defaultPriceId: string;

  @Column({ nullable: false })
  defaultStripePriceId: string;

  @Field(() => BillingAvailablePlanKey, { nullable: false })
  @Column({
    type: 'enum',
    enum: Object.values(BillingAvailablePlanKey),
    nullable: false,
  })
  planKey: BillingAvailablePlanKey;

  @OneToMany(() => BillingPrice, (billingPrice) => billingPrice.billingProduct)
  billingPrices: Relation<BillingPrice[]>;
}
